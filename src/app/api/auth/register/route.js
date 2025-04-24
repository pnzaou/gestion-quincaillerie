import dbConnection from "@/lib/db"
import User from "@/models/User.model"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { withAuthAndRole } from "@/utils/withAuthAndRole"
import { resend } from "@/lib/resend"
import AccountCreatedSuccessfully from "@/components/email/Acount-created-successfully"

export const POST = withAuthAndRole(async (req) => {
    try {
        await dbConnection()

        const { nom, prenom, email, password, role } = await req.json()

        if(!nom || !prenom || !email || !password || !role) {
            return NextResponse.json({
                message: "Tous les champs sont obligatoires.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if(role !== "admin" && role !== "gerant" && role!== "comptable") {
            return NextResponse.json({
                message: "rôle invalide.",
                success: false,
                error: true
            }, { status: 400 }) 
        }

        const existingUser = await User.findOne({ email })
        if(existingUser) {
            return NextResponse.json({
                message: "Cet email est déjà utilisé.",
                success: false,
                error: true
            }, { status: 400 })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            nom,
            prenom,
            email,
            password: hashedPassword,
            role
        })

        const loginLink = `${process.env.NEXT_PUBLIC_APP_URL}/login`

        const { data, error } = await resend.emails.send({
            from: "Support Quincallerie <onboarding@resend.dev>",
            to: "perrinemmanuelnzaou@gmail.com",
            subject: "Bienvenue sur Quincallerie",
            react: <AccountCreatedSuccessfully defaultPassword={password} loginLink={loginLink} userFullName={prenom}/>
        })

        if(error) {
            console.error("Erreur lors de l'envoie du mail de création de compte à l'utilisateur: ", error)
            return NextResponse.json({
                message: "Le mail n'a pas pu être envoyé.",
                success: false,
                error: true
            }, { status: 500 })
        }

        console.log("Email envoyé avec succès: ", data)

        return NextResponse.json({
            message: "Utilisateur créé avec succès.",
            data: newUser,
            success: true,
            error: false
        })
        
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})