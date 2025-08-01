import ComfirmResetPassword from "@/components/email/Comfirm-reset-password";
import dbConnection from "@/lib/db";
import { resend } from "@/lib/resend";
import PasswordResetToken from "@/models/PasswordResetToken.model";
import User from "@/models/User.model";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"

import { parsePasswordResetRequestDto } from "@/dtos/auth.dto";
import { requestPasswordReset } from "@/services/auth.service";

export const POST = async (req) => {
    try {
        // validation
        const body = await req.json()
        const dto = parsePasswordResetRequestDto(body)

        //Traitement
        await requestPasswordReset(dto)

        return NextResponse.json({
            message: "Un email de confirmation a été envoyé à votre adresse.",
            success: true,
            error: false
        }, { status: 200 })

    } catch (error) {
        const status  = error.status  || 500;
        const message = error.message || "Erreur! Veuillez réessayer.";
        console.error("POST /api/auth/forgot-password :", error);
        return NextResponse.json({
            message,
            success: false,
            error: true
        }, { status })
    }
}

export const PATCH = async (req) => {
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
        await dbConnection()
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

        const dbToken = await PasswordResetToken
            .findOne({ token })
            .session(mongoSession)
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

        const user = await User
            .findById(payload.userId)
            .session(mongoSession)
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
        console.error("Erreur lors de la modification du mot de passe de l'utilisateur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
}