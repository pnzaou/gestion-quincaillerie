import mongoose from "mongoose"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import authOptions from "@/lib/auth"
import { withAuth } from "@/utils/withAuth"
import { withAuthAndRole } from "@/utils/withAuthAndRole"
import dbConnection from "@/lib/db"
import Category from "@/models/Category.model"
import History from "@/models/History.model"

export const POST = withAuthAndRole(async (req) => {
    await dbConnection()
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
        const session = await getServerSession(authOptions)
        const { name, id } = session.user

        const { nom, description } = await req.json()

        if(!nom || !nom.trim()) {
            await mongoSession.abortTransaction()
            mongoSession.endSession()
            return NextResponse.json(
                {
                    message: "Veuillez renseigner le nom de la catégorie.",
                    success: false,
                    error: true
                }, 
                { status: 400 }
            )
        }

        const existingCategory = await Category.findOne({ nom }).session(mongoSession)
        if (existingCategory) {
            await mongoSession.abortTransaction()
            mongoSession.endSession()
            return NextResponse.json(
                { 
                    message: "Cette catégorie existe déjà.",
                    success: false,
                    error: true
                },
                { status: 400 }
            );
        }

        const [rep] = await Category.create(
            [{ nom, description }],
            { session: mongoSession }
        )
        await History.create([{
            user: id,
            actions: "create",
            resource: "category",
            resourceId: rep._id,
            description: `${name} a créé la catégorie ${rep.nom}`
        }], { session: mongoSession })

        await mongoSession.commitTransaction()
        mongoSession.endSession()

        return NextResponse.json({
            message: "Catégorie ajoutée avec succès.",
            data: rep,
            success: true,
            error: false 
        }, { status: 201 })

    } catch (error) {
        await mongoSession.abortTransaction()
        mongoSession.endSession()
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

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "0")
        const search = searchParams.get("search") || ""
        const skip = (page - 1) * limit

        const query = search
        ? { nom: { $regex: search, $options: "i" } }
        : {}

        const [categories, total] = await Promise.all([
            Category.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
            Category.countDocuments(query)
        ])

        return NextResponse.json(
            { 
                message: categories.length === 0? "Aucune catégorie enregistrée." : "Catégories récupérées avec succès.",
                data: categories,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
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
        },{ status: 500 })
    }
})