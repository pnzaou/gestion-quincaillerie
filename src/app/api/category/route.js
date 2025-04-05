import dbConnection from "@/lib/db"
import { withAuth } from "@/lib/withAuth"
import Category from "@/models/Category.model"
import { NextResponse } from "next/server"

export const POST = withAuth(async (req) => {
    try {
        await dbConnection()

        const { nom, description } = await req.json()

        if(!nom) {
            return NextResponse.json(
                {
                    message: "Veuillez renseigner le nom de la catégorie.",
                    success: false,
                    error: true
                }, 
                { status: 400 }
            )
        }

        const existingCategory = await Category.findOne({nom})
        if (existingCategory) {
            return NextResponse.json(
                { 
                    message: "Cette catégorie existe déjà.",
                    success: false,
                    error: true
                },
                { status: 400 }
            );
        }

        const rep = await Category.create({ nom, description })
        return NextResponse.json({
            message: "Catégorie ajoutée avec succès.",
            data: rep,
            success: true,
            error: false 
        }, { status: 201 })

    } catch (error) {
        console.error("Erreur lors de la création d'une catégorie: ", error)

        let errorMessage = "Erreur! Veuillez réessayer."

        if (error.code === 11000) {
            errorMessage = "Cette catégorie existe déjà."
        }

        return NextResponse.json({
            message: errorMessage,
            success: false,
            error: true
        }, { status: 500 }
        )
    }
})

export const GET = withAuth(async (req) => {
    try {
        await dbConnection()

        const rep = await Category.find()

        return NextResponse.json(
            { 
                message: rep.length === 0? "Aucune catégorie enregistrée." : "Catégories récupérées avec succès.",
                data: rep,
                success: true,
                error: false
            },
            { status: 200, headers: { "Cache-Control": "no-store" } }
        )
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        },
        { status: 500 }
        )
    }
})