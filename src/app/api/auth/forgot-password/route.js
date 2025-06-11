import ComfirmResetPassword from "@/components/email/Comfirm-reset-password";
import dbConnection from "@/lib/db";
import { resend } from "@/lib/resend";
import { withAuth } from "@/utils/withAuth";
import PasswordResetToken from "@/models/PasswordResetToken.model";
import User from "@/models/User.model";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"

export const POST = async (req) => {
    try {
        await dbConnection()
        const { email } = await req.json()

        if(!email) {
            return NextResponse.json({
                message: "Veuillez renseigner votre email.",
                success: false,
                error: true
            }, { status: 400 }) 
        }
        const user = await User.findOne({ email })
        
        if (!user) {
            return NextResponse.json({
                message: "Aucun compte utilisateur trouvé avec cet email.",
                success: false,
                error: true
            }, { status: 404 }) 
        }

        const payload = {
            userId: user._id,
            userEmail: email
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15min' })
        await PasswordResetToken.create({
            userId: user._id,
            token,
            expiresAt: Date.now() + 15 * 60 * 1000,
            used: false
        })

        const forgotPasswordLink = `${process.env.NEXT_PUBLIC_APP_URL}/forgot-password?token=${token}`

        const { data, error } = await resend.emails.send({
            from: "Support Quincallerie <onboarding@resend.dev>",
            to: email,
            subject: "Confirmation de la modification de votre mot de passe",
            react: <ComfirmResetPassword resetLink={forgotPasswordLink} userFullName={user.prenom}/>
        })

        if(error) {
            console.error("Erreur lors de l'envoie du mail mot de passe oublié: ", error)
            return NextResponse.json({
                message: "Erreur! Veuillez réessayer.",
                success: false,
                error: true
            }, { status: 500 })
        }

        console.log("Email envoyé avec succès: ", data)
        return NextResponse.json({
            message: "Un email de confirmation a été envoyé à votre adresse.",
            success: true,
            error: false
        }, { status: 200 })

    } catch (error) {
        console.error("Erreur lors de la demande de réinitialisation de mot de passe oublié: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
}

export const PATCH = async (req) => {
    try {
        const { token, password, confirmPassword } = await req.json()

        if(!token) {
            console.error("Impossible de récupérer le token.")
            return NextResponse.json({
                message: "Veuillez fournir un token.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if(!password || !confirmPassword) {
            return NextResponse.json({
                message: "Tous les champs sont obligatoires.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if(password !== confirmPassword) {
            return NextResponse.json({
                message: "Les deux mots de passe sont différents.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const dbToken = await PasswordResetToken.findOne({ token })
        if(!dbToken || dbToken.used || dbToken.expiresAt < Date.now()) {
            return NextResponse.json({
                message: "Lien de réinitialisation invalide ou expiré.",
                success: false,
                error: true
            }, { status: 400 })
        }

        let payload
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET) 
        } catch (error) {
            return NextResponse.json({
                message: "Token invalide.",
                success: false,
                error: true
            }, { status: 400 }) 
        }

        if(!mongoose.Types.ObjectId.isValid(payload.userId)) {
            return NextResponse.json({
                message: "Token invalide.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const user = await User.findById(payload.userId)
        if(!user) {
            return NextResponse.json({
                message: "Aucun utilisateur ne correspond à cet ID.",
                success: false,
                error: true
            }, { status: 400 }) 
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        user.password = hashedPassword
        await user.save()  
        
        dbToken.used = true
        await dbToken.save()
        await PasswordResetToken.updateMany({
            token: { $ne: token },
            userId: payload.userId,
            used: false
        }, { $set: { used: true } })

        return NextResponse.json({
            message: "Mot de passe modifié avec succès.",
            success: true,
            error: false
        }, { status: 200 })

    } catch (error) {
        console.error("Erreur lors de la modifications du mot de passe de l'utilisateur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
}