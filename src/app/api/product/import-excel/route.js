import authOptions from "@/lib/auth"
import dbConnection from "@/lib/db"
import History from "@/models/History.model"
import Product from "@/models/Product.model"
import { mapRowData, productAliasMapping } from "@/utils/mapping"
import { withAuthAndRole } from "@/utils/withAuthAndRole"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export const POST = withAuthAndRole(async (req) => {
    await dbConnection()
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()

    try {
        const session = await getServerSession(authOptions)
        const { name, id } = session.user
        const data = await req.formData()
        const file = data.get("file")

        if (!file) {
            await mongoSession.abortTransaction()
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
            const mapped = mapRowData(rawRow, productAliasMapping)
            const nom = mapped.nom?.trim()
            const prixAchatEnGros = mapped.prixAchatEnGros
            const prixVenteEnGros = mapped.prixVenteEnGros
            const prixAchatDetail = mapped.prixAchatDetail || 0
            const prixVenteDetail = mapped.prixVenteDetail || 0
            const QteInitial = mapped.QteInitial || 0
            const QteStock = mapped.QteStock || 0
            const QteAlerte = mapped.QteAlerte || 0
            const reference = mapped.reference?.trim() || ""
            const description = mapped.description?.trim() || ""

            if (!nom || prixAchatEnGros === undefined || prixVenteEnGros === undefined || QteInitial === undefined || QteStock === undefined || QteAlerte === undefined) continue

            const existingProd = await Product.findOne({ nom }).session(mongoSession)
            if (existingProd) {
                doublons.push(nom)
                continue
            }

            const statut = (QteStock > 0)? "En stock" : "En rupture"

            const [newProd] = await Product.create([{ 
                nom,
                prixAchatEnGros,
                prixVenteEnGros,
                prixAchatDetail,
                prixVenteDetail,
                QteInitial,
                QteStock,
                QteAlerte,
                reference,
                description,
                statut
            }], { session: mongoSession })
            inserted.push(newProd)
        }

        await History.create([{
            user: id,
            actions: "create",
            resource: "product",
            description: `${name} a importé ${inserted.length} articles depuis Excel.`,
        }], { session: mongoSession })

        await mongoSession.commitTransaction()

        let message = ""

        if (inserted.length === 0 && doublons.length > 0) {
            message = "Aucun article ajouté : ils existent déjà tous."
        } else if (inserted.length > 0 && doublons.length > 0) {
            message = `${inserted.length} article(s) ajouté(s). ${doublons.length} déjà existant(s) ignoré(s).`
        } else if (inserted.length > 0 && doublons.length === 0) {
            message = "Tous les articles ont été ajoutés avec succès."
        } else {
            message = "Aucune donnée valide trouvée dans le fichier."
        }

        return NextResponse.json({
            message,
            success: true,
            error: false,
            créés: inserted.length,
            doublons
        }, { status: 201 })

    } catch (error) {
        await mongoSession.abortTransaction()
        console.error("Erreur lors de l'importation des articles: ", error)

        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    } finally {
        mongoSession.endSession()
    }
})