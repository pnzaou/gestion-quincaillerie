import dbConnection from "@/lib/db"
import { withAuthAndRole } from "@/utils/withAuthAndRole"
import Category from "@/models/Category.model"
import * as XLSX from "xlsx"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

export const GET = withAuthAndRole(async (req) => {
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

        const categories = await Category.find({ business: businessObjectId }).lean()

        if (!categories || categories.length === 0) {
            return NextResponse.json({
                message: "Aucune catégorie trouvée.",
                success: false,
                error: true
            }, { status: 404 })
        }

        const rows = categories.map((cat) => ({
            Nom: cat.nom,
            Description: cat.description || ""
        }))

        const worksheet = XLSX.utils.json_to_sheet(rows)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Catégories")

        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Disposition": "attachment; filename=categories.xlsx",
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        })
    } catch (error) {
        console.error("Erreur lors de l'exportation des catégories en Excel:", error)
        return NextResponse.json({
            message: "Erreur serveur.",
            success: false,
            error: true
        }, { status: 500 })
    }
})