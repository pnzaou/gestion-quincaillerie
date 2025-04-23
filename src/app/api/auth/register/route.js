import dbConnection from "@/lib/db"
import User from "@/models/User.model"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { withAuthAndRole } from "@/utils/withAuthAndRole"

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