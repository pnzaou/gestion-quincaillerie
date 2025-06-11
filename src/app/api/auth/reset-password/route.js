import authOptions from "@/lib/auth"
import dbConnection from "@/lib/db"
import { withAuth } from "@/utils/withAuth"
import User from "@/models/User.model"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { resend } from "@/lib/resend"
import ComfirmResetPassword from "@/components/email/Comfirm-reset-password"
import jwt from "jsonwebtoken"
import PasswordResetToken from "@/models/PasswordResetToken.model"
import History from "@/models/History.model"

export const GET = withAuth( async (req) => {
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

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
            { userId: id, userEmail: email },
            process.env.JWT_SECRET,
            { expiresIn: "15min" }
        )

        await PasswordResetToken.create([{
            userId: id,
            token,
            expiresAt: Date.now() + 15 * 60 * 1000,
            used: false
        }], { session: mongoSession })

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
        
        const { error } = await resend.emails.send({
            from: "Support Quincallerie <onboarding@resend.dev>",
            to: email,
            subject: "Confirmation de la modification de votre mot de passe",
            react: <ComfirmResetPassword userFullName={name.split(" ")[0]} resetLink={resetLink}/>
        })

        if(error) {
            await mongoSession.abortTransaction()
            mongoSession.endSession()
            console.error("Erreur lors de l'envoie du mail de la confirmation de la modification du mot de passe: ", error)
            return NextResponse.json({
                message: "Erreur! Veuillez réessayer.",
                success: false,
                error: true
            }, { status: 500 })
        }

        await History.create([{
            user: id,
            actions: "update",
            resource: "password",
            resourceId: id,
            description: `L'utilisateur ${name} a envoyé une demande de modification de son mot de passe.`
        }], { session: mongoSession })

        await mongoSession.commitTransaction()
        mongoSession.endSession()

        return NextResponse.json({
            message: "Un email de confirmation a été envoyé à votre adresse.",
            success: true,
            error: false
        }, { status: 200 }) 
        
    } catch (error) {
        await mongoSession.abortTransaction()
        mongoSession.endSession()
        console.error("Erreur lors de l'envoie du mail de la confirmation de la modification du mot de passe: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})

export const PATCH = withAuth( async (req) => {
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
        await dbConnection()

        const sessionData = await getServerSession(authOptions)
        const { id } = sessionData.user
        const { token, oldPassword, newPassword, confirmPassword } = await req.json()

        if(!token) {
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

        const dbToken = await PasswordResetToken
            .findOne({ token })
            .session(mongoSession)
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

        const user = await User
            .findById(id)
           .session(mongoSession)
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
        await user.save({ session: mongoSession})

        dbToken.used = true
        await dbToken.save({ session: mongoSession })
        await PasswordResetToken.updateMany(
            {
                token: { $ne: token },
                userId: payload.userId,
                used: false
            }, 
            { $set: { used: true } },
            { session: mongoSession }
        )

        await History.create([{
            user: user._id,
            actions: "update",
            resource: "password",
            resourceId: user._id,
            description: `Modification du mot de passe de l'utilisateur ${user.name}`
        }], { session: mongoSession })

        await mongoSession.commitTransaction()
        mongoSession.endSession()

        return NextResponse.json({
            message: "Mot de passe modifié avec succès.",
            success: true,
            error: false
        }, { status: 200 })

    } catch (error) {
        await mongoSession.abortTransaction()
        mongoSession.endSession()
        console.error("Erreur lors de la modifications du mot de passe de l'utilisateur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})