import dbConnection from "@/lib/db"
import { withAuthAndRole } from "@/lib/withAuthAndRole"
import User from "@/models/User.model"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

export const PATCH = withAuthAndRole( async (req, { params }) => {
    try {
        await dbConnection()
        const { id } = await params

        if(!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ 
                message: "Veuillez fournir un ID valide", 
                success: false, 
                error: true 
            }, { status: 400 })
        }

        const user = await User.findById(id)
        if (!user) {
            return NextResponse.json({
                message: "Aucun utilisateur trouvé pour cet ID",
                success: false,
                error: true
            }, { status: 404 })
        }

        user.status = user.status === "actif" ? "suspendu" : "actif"
        await user.save()

        return NextResponse.json({
            message: `Statut mis à jour en "${user.status}"`,
            success: true,
            error: false,
            data: user
        }, { status: 200 })

    } catch (error) {
        console.error("Erreur lors de la modifications de l'utilisateur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})

export const DELETE = withAuthAndRole(async (req, { params }) => {
    try {
        await dbConnection()
        const { id } = await params 

        if(!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ 
                message: "Veuillez fournir un ID valide", 
                success: false, 
                error: true 
            }, { status: 400 })
        }

        const deletedUser = await User.findByIdAndDelete(id)
        if(!deletedUser) {
            return NextResponse.json({ 
                message: "Aucun utilisateur trouvée pour cet ID.",
                success: false,
                error: true 
            }, { status: 404 })
        }

        return NextResponse.json({ 
            message: "Utilisateur supprimé avec succès.",
            success: true,
            error: false 
        }, { status: 200 })

    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})