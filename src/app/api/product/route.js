import dbConnection from "@/lib/db"
import Product from "@/models/Product.model"
import { NextResponse } from "next/server"

export const POST = async (req) => {
    try {
        await dbConnection()

        const { nom, prix, Qte, fournisseur, description, category_id } = await req.json()

        if(!nom || !prix || !Qte || !category_id) {
            return NextResponse.json({
                message: "Veuillez renseigner le nom, le prix, la quantité et la catégorie du produit.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const parsedPrix = Number(prix)
        const parsedQte = Number(Qte)

        if (isNaN(parsedPrix) || parsedPrix <= 0) {
            return NextResponse.json({
                message: "Le prix doit être un nombre positif.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if (isNaN(parsedQte) || parsedQte < 0) {
            return NextResponse.json({
                message: "La quantité doit être un nombre entier positif ou nul.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if (!mongoose.Types.ObjectId.isValid(category_id)) {
            return NextResponse.json({
                message: "L'ID de la catégorie est invalide.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const existingProduct = await Product.findOne({nom})
        if(existingProduct) {
            return NextResponse.json(
                { 
                    message: "Ce produit existe déjà.",
                    success: false,
                    error: true
                },
                { status: 400 }
            );
        }

        const rep = await Product.create({
            nom,
            prix: parsedPrix,
            Qte: parsedQte,
            fournisseur,
            description,
            category_id
        })

        return NextResponse.json({
            message: "Produit ajouté avec succès.",
            data: rep,
            success: true,
            error: false
        }, { status: 201 })

        
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un produit: ", error)

        let errorMessage = "Erreur! Veuillez réessayer."

        if (error.code === 11000) {
            errorMessage = "Ce produit existe déjà."
        }

        return NextResponse.json({
            message: errorMessage,
            success: false,
            error: true
        }, { status: 500 })
    }
}

export const GET = async () => {
    try {
        await dbConnection()

        const rep = await Product.find()

        return NextResponse.json(
            { 
                message: rep.length === 0? "Aucun produit enregistré." : "produits récupérés avec succès.",
                data: rep,
                success: true,
                error: false
            },
            { status: 200, headers: { "Cache-Control": "no-store" } }
        )
        
    } catch (error) {
        console.error("Erreur lors de la récupération des produits: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
}