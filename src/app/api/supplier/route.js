import dbConnection from "@/lib/db"
import Supplier from "@/models/Supplier.model"
import { NextResponse } from "next/server"
import { withAuthAndRole } from "@/utils/withAuthAndRole"


export const POST = withAuthAndRole( async (req) => {
    try {
        await dbConnection()

        const { nom, adresse, telephone, email } = await req.json()

        if(!nom.trim() || !telephone.trim()) {
            return NextResponse.json(
                {
                    message: "Veuillez renseigner le nom et le numéro de téléphone du fournisseur.",
                    success: false,
                    error: true
                },
                { status: 400 }
            )
        }

        const nomNormalise = nom.trim().toLowerCase()
        const emailNormalise = email?.trim().toLowerCase()

        const existingSupplier = await Supplier.findOne({ nom: nomNormalise })
        if(existingSupplier) {
            return NextResponse.json(
                {
                    message: "Ce fournisseur existe déjà.",
                    success: false,
                    error: true
                },
                { status: 400 }
            )
        }

        if(telephone.trim()) {
            const existingTelephone = await Supplier.findOne({ telephone })
            if(existingTelephone) {
                return NextResponse.json(
                    {
                        message: "Ce numéro de téléphone est déjà utilisé.",
                        success: false,
                        error: true
                    }, { status: 400 }
                )
            }
        }

        const data = {
            nom: nomNormalise,
            adresse,
            telephone: telephone.trim(),
        }

        if(emailNormalise) {
            const existingEmail = await Supplier.findOne({ email: emailNormalise })
            if(existingEmail) {
                return NextResponse.json(
                    {
                        message: "Cet email est déjà utilisé.",
                        success: false,
                        error: true
                    }, { status: 400 }
                )
            }
            data.email = emailNormalise
        }

        const rep = await Supplier.create(data)

        return NextResponse.json({
            message: "Fournisseur créé avec succès.",
            success: true,
            error: false,
            data: rep
        }, { status: 201 })

    } catch (error) {
        console.error("Erreur lors de la création d'un fournisseur: ", error)

        let errorMessage = "Erreur! Veuillez réessayer."

        if (error.code === 11000) {
            errorMessage = "Ce fournisseur existe déjà."
        }

        return NextResponse.json({
            message: errorMessage,
            success: false,
            error: true
        }, { status: 500 }
        )
    }
} )

export const GET = withAuthAndRole( async (req) => {
    try {
        await dbConnection()

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "5")
        const search = searchParams.get("search") || ""
        const skip = (page - 1) * limit

        const query = search
        ? { nom: { $regex: search, $options: "i" } }
        : {}

        const [fournisseurs, total] = await Promise.all([
            Supplier.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
            Supplier.countDocuments(query)
        ])

        return NextResponse.json(
            { 
                message: fournisseurs.length === 0? "Aucun fournisseur enregistré." : "Fournisseurs récupérés avec succès.",
                data: fournisseurs,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                success: true,
                error: false
            },
            { status: 200, headers: { "Cache-Control": "no-store" } }
        )
    } catch (error) {
        console.error("Erreur lors de la récupération des fournisseurs: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        },{ status: 500 })
    }
})