import dbConnection from "@/lib/db"
import Product from "@/models/Product.model"
import Category from "@/models/Category.model"
import Supplier from "@/models/Supplier.model"
import { withAuth } from "@/utils/withAuth"
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import * as XLSX from "xlsx"

export const GET = withAuth(async (req) => {
    try {
        await dbConnection()

        const { searchParams } = new URL(req.url)
        const businessId = searchParams.get("businessId")

        if (!businessId) {
            return NextResponse.json({
                message: "ID de la boutique manquant.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const businessObjectId = new mongoose.Types.ObjectId(businessId)

        const articles = await Product.find({ business: businessObjectId })
            .populate('category_id', 'nom')
            .populate('supplier_id', 'nom')

        if (!articles || articles.length === 0) {
            return NextResponse.json({
                message: "Aucun article trouvé.",
                success: false,
                error: true
            }, { status: 404 })
        }
        
        const rows = articles.map((article) => ({
            Nom: article.nom,
            PrixAchatEnGros: article.prixAchatEnGros,
            PrixVenteEnGros: article.prixVenteEnGros,
            PrixAchatDetail: article.prixAchatDetail || "",
            PrixVenteDetail: article.prixVenteDetail || "",
            QteInitial: article.QteInitial,
            QteStock: article.QteStock,
            QteAlerte: article.QteAlerte,
            Reference: article.reference || "",
            Description: article.description || "",
            DateExpiration: article.dateExpiration ? article.dateExpiration.toLocaleDateString() : "",
            Categorie: article.category_id ? article.category_id.nom : "",
            Fournisseur: article.supplier_id ? article.supplier_id.nom : ""
        }))

        const worksheet = XLSX.utils.json_to_sheet(rows)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Articles")

        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Disposition": "attachment; filename=articles.xlsx",
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        })
        
    } catch (error) {
        console.error("Erreur lors de l'exportation des articles en Excel:", error)
        return NextResponse.json({
            message: "Erreur ! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})