import dbConnection from "@/lib/db"
import { withAuthAndRole } from "@/utils/withAuthAndRole"
import * as XLSX from "xlsx"
import { NextResponse } from "next/server"
import { catAliasMapping, mapRowData } from "@/utils/mapping"
import Category from "@/models/Category.model"

export const POST = withAuthAndRole(async (req) => {
    try {
        await dbConnection()

        const data = await req.formData()
        const file = data.get("file")

        if (!file) {
            return NextResponse.json(
                {
                    message: "Aucun fichier reçu.",
                    success: false,
                    error: true
                },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const workbook = XLSX.read(buffer, { type: "buffer" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rawRows = XLSX.utils.sheet_to_json(sheet)

        const inserted = []
        const doublons = []

        for (const rawRow of rawRows) {
            const mapped = mapRowData(rawRow, catAliasMapping)
            const nom = mapped.nom?.trim()
            const description = mapped.description?.trim() || ""

            if (!nom) continue

            const existingCat = await Category.findOne({ nom })
            if (existingCat) {
                doublons.push(nom)
                continue
            }

            const newCat = await Category.create({ nom, description })
            inserted.push(newCat)
        }

        let message = ""

        if (inserted.length === 0 && doublons.length > 0) {
            message = "Aucune catégorie ajoutée : elles existent déjà toutes."
        } else if (inserted.length > 0 && doublons.length > 0) {
            message = `${inserted.length} catégorie(s) ajoutée(s). ${doublons.length} déjà existante(s) ignorée(s).`
        } else if (inserted.length > 0 && doublons.length === 0) {
            message = "Toutes les catégories ont été ajoutées avec succès."
        } else {
            message = "Aucune donnée valide trouvée dans le fichier."
        }

        return NextResponse.json({
            message,
            success: true,
            error: false,
            créées: inserted.length,
            doublons
        }, { status: 201 })

    } catch (error) {
        console.error("Erreur lors de la création d'une catégorie: ", error)

        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})
