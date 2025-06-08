import dbConnection from "@/lib/db"
import { withAuth } from "@/utils/withAuth"
import Product from "@/models/Product.model"
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import cloudinary from "@/lib/cloudinary"

export const POST = withAuth(async (req) => {
    try {
        await dbConnection()

        const { nom, prixAchatEnGros, prixVenteEnGros, prixAchatDetail, prixVenteDetail, QteInitial, QteStock, QteAlerte, image, reference, description, dateExpiration, category_id, supplier_id } = await req.json()

        if(!nom || prixAchatEnGros === undefined || prixVenteEnGros === undefined || QteInitial === undefined || QteStock === undefined || QteAlerte === undefined || !category_id || !supplier_id) {
            return NextResponse.json({
                message: "Veuillez renseigner les champs obligatoires.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const parsedAchatEnGros = Number(prixAchatEnGros)
        const parsedVenteEnGros = Number(prixVenteEnGros)
        const parsedAchatDetail = prixAchatDetail ? Number(prixAchatDetail) : undefined
        const parsedVenteDetail = prixVenteDetail ? Number(prixVenteDetail) : undefined
        const parsedQteInitial = Number(QteInitial)
        const parsedQteStock = QteStock !== undefined ? Number(QteStock) : parsedQteInitial
        const parsedQteAlerte = Number(QteAlerte)

        const statut = (parsedQteStock > 0) ? "En stock" : "En rupture"

        if (
            isNaN(parsedAchatEnGros) || parsedAchatEnGros <= 0 ||
            isNaN(parsedVenteEnGros) || parsedVenteEnGros <= 0
        ) {
            return NextResponse.json({
                message: "Les prix d'achat et de vente en gros doivent être des nombres positifs.",
                success: false,
                error: true
            }, { status: 400 });
        }

        if (
            (prixAchatDetail && (isNaN(parsedAchatDetail) || parsedAchatDetail <= 0)) ||
            (prixVenteDetail && (isNaN(parsedVenteDetail) || parsedVenteDetail <= 0))
        ) {
            return NextResponse.json({
                message: "Les prix d'achat et de vente en détail doivent être des nombres positifs.",
                success: false,
                error: true
            }, { status: 400 });
        }

        if (
            isNaN(parsedQteInitial) || parsedQteInitial < 0 ||
            isNaN(parsedQteStock) || parsedQteStock < 0 ||
            isNaN(parsedQteAlerte) || parsedQteAlerte < 0
        ) {
            return NextResponse.json({
                message: "Les quantités doivent être des nombres entiers positifs ou nuls.",
                success: false,
                error: true
            }, { status: 400 });
        }

        if (category_id && !mongoose.Types.ObjectId.isValid(category_id)) {
            return NextResponse.json({
                message: "L'ID de la catégorie est invalide.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if (supplier_id && !mongoose.Types.ObjectId.isValid(supplier_id)) {
            return NextResponse.json({
                message: "L'ID du fournisseur est invalide.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if (dateExpiration && isNaN(Date.parse(dateExpiration))) {
            return NextResponse.json({
                message: "La date d'expiration est invalide.",
                success: false,
                error: true
            }, { status: 400 });
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
        const data = {
            nom,
            prixAchatEnGros: parsedAchatEnGros,
            prixVenteEnGros: parsedVenteEnGros,
            prixAchatDetail: parsedAchatDetail,
            prixVenteDetail: parsedVenteDetail,
            QteInitial: parsedQteInitial,
            QteStock: parsedQteStock,
            QteAlerte: parsedQteAlerte,
            reference,
            description,
            dateExpiration,
            category_id,
            supplier_id,
            statut
        }

        if(image && typeof image === "string" && image.startsWith("data:image/")) {
            try {
                const rep = await cloudinary.uploader.upload(image, {folder: "quincaillerie"})
                data.image = rep.secure_url 
            } catch (uploadErr) {
                console.error("Erreur Cloudinary: ", uploadErr)
                return NextResponse.json({
                    message: "Erreur lors de l'upload de l'image.",
                    success: false,
                    error: true
                }, { status: 500 });
            }
        }

        const rep = await Product.create(data)

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
})

export const GET = withAuth(async (req) => {
    try {
        await dbConnection()

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const search = searchParams.get("search") || ""
        const categories = searchParams.get("categories") || ""
        const skip = (page - 1) * limit

        const selectedCategories = categories
        ? categories.split(",").filter(Boolean).map((cat) => new mongoose.Types.ObjectId(cat))
        : []

        const query = {
            ...(search 
                ? {
                   $or: [
                       { nom: { $regex: search, $options: "i" } },
                       { reference: { $regex: search, $options: "i" } }
                   ]
                } 
                : {}),
            ...(selectedCategories.length > 0
                ? { category_id: { $in: selectedCategories } }
                : {})
        }

        const [articles, total] = await Promise.all([
            Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
            Product.countDocuments(query)
        ])

        return NextResponse.json(
            { 
                message: articles.length === 0? "Aucun article enregistré." : "Articles récupérés avec succès.",
                data: articles,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                success: true,
                error: false
            },
            { status: 200, headers: { "Cache-Control": "no-store" } }
        )
        
    } catch (error) {
        console.error("Erreur lors de la récupération des articles: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})

