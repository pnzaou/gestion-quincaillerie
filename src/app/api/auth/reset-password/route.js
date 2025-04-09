import authOptions from "@/lib/auth"
import dbConnection from "@/lib/db"
import { withAuth } from "@/lib/withAuth"
import User from "@/models/User.model"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { resend } from "@/lib/resend"
import ComfirmResetPassword from "@/components/email/Comfirm-reset-password"
import jwt from "jsonwebtoken"
import PasswordResetToken from "@/models/PasswordResetToken.model"

export const GET = withAuth( async (req) => {
    try {
        const session = await getServerSession(authOptions)
        const { email, name, id } = session.user
        await dbConnection()

        if(!email) {
            console.error("Impossible de récupérer l'email de l'utilisateur connecté.")
            return NextResponse.json({
                message: "Impossible de récupérer l'email de l'utilisateur connecté.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const token = jwt.sign(
            { userId: id, email },
            process.env.JWT_SECRET,
            { expiresIn: "15min" }
        )

        await PasswordResetToken.create({
            userId: id,
            token,
            expiresAt: Date.now() + 15 * 60 * 1000,
            used: false
        })

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
        
        const { data, error } = await resend.emails.send({
            from: "Support Quincallerie <onboarding@resend.dev>",
            to: email,
            subject: "Confirmation de la modification de votre mot de passe",
            react: <ComfirmResetPassword userFullName={name.split(" ")[0]} resetLink={resetLink}/>
        })

        if(error) {
            console.error("Erreur lors de l'envoie du mail de la confirmation de la modification du mot de passe: ", error)
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
        console.error("Erreur lors de l'envoie du mail de la confirmation de la modification du mot de passe: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})


export const PATCH = withAuth( async (req) => {
    try {
        await dbConnection()

        const session = await getServerSession(authOptions)
        const { id } = session.user
        const { token, oldPassword, newPassword, confirmPassword } = await req.json()

        if(!token) {
            console.error("Impossible de récupérer le token.")
            return NextResponse.json({
                message: "Veuillez fournir un token.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if(!oldPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({
                message: "Tous les champs sont obligatoires.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const dbToken = await PasswordResetToken.findOne({ token })
        if(!dbToken || dbToken.expiresAt < Date.now() || dbToken.used) {
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

        if(!id || !mongoose.Types.ObjectId.isValid(id)) {
            console.error("Impossible de récupérer l'ID de l'utilisateur connecté ou ID invalid.")
            return NextResponse.json({
                message: "Veuillez fournir un ID valid.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if(id !== payload.userId) {
            return NextResponse.json({
                message: "Utilisateur non autorisé à utiliser ce token.",
                success: false,
                error: true
            }, { status: 403 })
        }

        const user = await User.findById(id)
        if(!user) {
            return NextResponse.json({
                message: "Aucun utilisateur ne correspond à cet ID.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const checkedPassword = await bcrypt.compare(oldPassword, user.password)
        if(!checkedPassword) {
            return NextResponse.json({
                message: "Ancien mot de passe incorrect.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if( newPassword !== confirmPassword ) {
            return NextResponse.json({
                message: "Les deux mots de passe sont différents",
                success: false,
                error: true
            }, { status: 400 })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        user.password = hashedPassword
        await user.save()

        dbToken.used = true
        await dbToken.save()

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
})