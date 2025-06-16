import dbConnection from "@/lib/db"
import User from "@/models/User.model"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { withAuthAndRole } from "@/utils/withAuthAndRole"
import History from "@/models/History.model"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import mongoose from "mongoose"
import Outbox from "@/models/Outbox.model"

const mdpRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/

export const POST = withAuthAndRole(async (req) => {
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
        await dbConnection()

        const sessionData = await getServerSession(authOptions)
        const { name, id } = sessionData?.user
        const { nom, prenom, email, password, role } = await req.json()

        if(!nom || !prenom || !email || !password || !role) {
            return NextResponse.json({
                message: "Tous les champs sont obligatoires.",
                success: false,
                error: true
            }, { status: 400 })
        }
        
        if(!mdpRegex.test(password)) {
            return NextResponse.json({
                message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if(!emailRegex.test(email)) {
            return NextResponse.json({
                message: "Format de l'email invalide.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if(!["admin", "gerant", "comptable"].includes(role)) {
            return NextResponse.json({
                message: "rôle invalide.",
                success: false,
                error: true
            }, { status: 400 }) 
        }

        const existingUser = await User
            .findOne({ email })
            .session(mongoSession)
        if(existingUser) {
            return NextResponse.json({
                message: "Cet email est déjà utilisé.",
                success: false,
                error: true
            }, { status: 400 })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const [newUser] = await User.create([{
            nom,
            prenom,
            email,
            password: hashedPassword,
            role
        }], { session: mongoSession })

        await History.create([{
            user: id,
            actions: "create",
            resource: "user",
            resourceId: newUser._id,
            description: `${name} a créé un compte pour ${prenom} (${email})`
        }], { session: mongoSession })

        await Outbox.create([{
            type: 'welcome_email',
            payload: {
                to: "perrinemmanuelnzaou@gmail.com", //changer pour le deploiement
                defaultPassword: password,
                loginLink: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
                userFullName: prenom
            }
        }], { session: mongoSession })

        await mongoSession.commitTransaction()
        mongoSession.endSession()

        return NextResponse.json({
            message: "Utilisateur créé avec succès.",
            success: true,
            error: false
        }, { status: 201 })
        
    } catch (error) {
        await mongoSession.abortTransaction()
        mongoSession.endSession()
        console.error("Erreur lors de la création de l'utilisateur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})