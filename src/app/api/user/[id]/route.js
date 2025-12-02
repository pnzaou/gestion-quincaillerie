import dbConnection from "@/lib/db"
import { withAuthAndRole } from "@/utils/withAuthAndRole"
import User from "@/models/User.model"
import mongoose from "mongoose"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import BusinessModel from "@/models/Business.model"

export const GET = withAuthAndRole(async (req, { params }) => {
    try {
        await dbConnection()
        const { id } = await params

        if(!id ||!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                message: "Veuillez fournir un ID valide",
                success: false,
                error: true
            }, { status: 400 })
        }

        const user = await User.findById(id, { password: 0})
        if (!user) {
            return NextResponse.json({
                message: "Aucun utilisateur trouvé pour cet ID",
                success: false,
                error: true
            }, { status: 404 })
        }

        return NextResponse.json({
            message: "Utilisateur trouvé avec succès",
            success: true,
            error: false,
            data: user
        }, { status: 200 })
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})

export const PUT = withAuthAndRole(async (req, { params }) => {
    try {
        await dbConnection()
        const { id } = await params
        const { nom, prenom, email, role, password, business } = await req.json()

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

        // Validation: si le rôle est ou devient "gerant", la boutique est obligatoire
        const newRole = role || user.role
        if (newRole === "gerant" && !business && !user.business) {
            return NextResponse.json({
                message: "La boutique est obligatoire pour un gérant",
                success: false,
                error: true
            }, { status: 400 })
        }

        // Vérifier que la boutique existe si fournie
        if (business && mongoose.Types.ObjectId.isValid(business)) {
            const businessExists = await BusinessModel.findById(business)
            if (!businessExists) {
                return NextResponse.json({
                    message: "La boutique spécifiée n'existe pas",
                    success: false,
                    error: true
                }, { status: 400 })
            }
        }

        user.nom = nom || user.nom
        user.prenom = prenom || user.prenom
        user.email = email || user.email
        user.role = role || user.role
        
        // Gérer la boutique en fonction du rôle
        if (newRole === "gerant") {
            // Si c'est un gérant, mettre à jour ou conserver la boutique
            if (business) {
                user.business = business
            }
        } else {
            // Si ce n'est plus un gérant, supprimer la référence à la boutique
            user.business = undefined
        }
        
        if(password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
        }

        await user.save()

        return NextResponse.json({
            message: "Utilisateur modifié avec succès",
            success: true,
            error: false,
        }, { status: 200 });
        
    } catch (error) {
        console.error("Erreur lors de la modification de l'utilisateur: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})

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
        console.error("Erreur lors de la modifications du statut de l'utilisateur: ", error)
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