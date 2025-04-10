import ComfirmResetPassword from "@/components/email/Comfirm-reset-password";
import dbConnection from "@/lib/db";
import { resend } from "@/lib/resend";
import { withAuth } from "@/lib/withAuth";
import PasswordResetToken from "@/models/PasswordResetToken.model";
import User from "@/models/User.model";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = withAuth(async (req) => {
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
})