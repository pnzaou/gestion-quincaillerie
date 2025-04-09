import dbConnection from "@/lib/db"
import { withAuth } from "@/lib/withAuth"
import Product from "@/models/Product.model"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

export const GET = withAuth(async (req, {params}) => {
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

        const prod = await Product.findById(id)
        if(!prod) {
            return NextResponse.json({
                message: "Aucun produit trouvé pour cet ID",
                success: false,
                error: true
            },{ status: 404 })
        }

        return NextResponse.json({
            message: "Produit récupéré avec succès.",
            data: prod,
            success: true,
            error: false
        },{ status: 200, headers: { "Cache-Control": "no-store" } })

    } catch (error) {
        console.error("Erreur lors de la récupération du produit: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})

export const PUT = withAuth(async (req, {params}) => {
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

        const { nom, prix, Qte, fournisseur, description, category_id } = await req.json()

        if(!nom && !prix && !Qte && !fournisseur && !description && !category_id) {
            return NextResponse.json({ 
                message: "Aucune donnée fournie pour la mise à jour.", 
                success: false, 
                error: true 
            }, { status: 400 })
        }

        if(category_id && !mongoose.Types.ObjectId.isValid(category_id)) {
            return NextResponse.json({ 
                message: "Veuillez fournir un ID de catégorie valide", 
                success: false, 
                error: true 
            }, { status: 400 })
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, {
            nom,
            prix,
            Qte,
            fournisseur,
            description,
            category_id
        },{ new: true, runValidators: true })

        if(!updatedProduct) {
            return NextResponse.json({ 
                message: "Aucune catégorie trouvée pour cet ID.",
                success: false,
                error: true 
            }, { status: 404 })
        }

        return NextResponse.json({ 
            message: "Produit mis à jour avec succès.",
            data: updatedProduct,
            success: true,
            error: false 
        },{ status: 200 })

    } catch (error) {
        console.error("Erreur lors de la modification du produit: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})

export const DELETE = withAuth(async (req, {params}) => {
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

        const deletedProduct = await Product.findByIdAndDelete(id)

        if (!deletedProduct) {
            return NextResponse.json({ 
                message: "Aucun produit trouvé pour cet ID.", 
                success: false, 
                error: true 
            }, { status: 404 })
        }

        return NextResponse.json({ 
            message: "Produit supprimé avec succès.", 
            success: true, 
            error: false 
        }, { status: 200 })

    } catch (error) {
        console.error("Erreur lors de la suppression du produit: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})