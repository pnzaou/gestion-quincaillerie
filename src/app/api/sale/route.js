import authOptions from "@/lib/auth"
import dbConnection from "@/lib/db"
import Sale from "@/models/Sale.model"
import { withAuth } from "@/utils/withAuth"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { generateReference } from "@/utils/generateReference"
import { getOrCreateClient } from "@/utils/handleClient"
import { validateAndUpdateProducts } from "@/utils/validateAndUpdateProducts"
import History from "@/models/History.model"
import Client from "@/models/Client.model"
import User from "@/models/User.model"

export const POST = withAuth(async (req) => {
    await dbConnection()
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()
    
    try {
        const session = await getServerSession(authOptions)
        const payload = await req.json()

        const now = new Date(payload.dateExacte || Date.now())

        // Génération de la référence de vente
        const reference = await generateReference(now, mongoSession)

        // Création ou récupération du client
        const clientIdOrResponse = await getOrCreateClient(payload.client, mongoSession)
        if (clientIdOrResponse instanceof Response) return clientIdOrResponse
        const clientId = clientIdOrResponse
        
        // Vérification des produits et mise à jour du stock
        const productValidationResponse = await validateAndUpdateProducts(payload.items, mongoSession)
        if(productValidationResponse) return productValidationResponse

        const sale = await Sale.create([
            {
                reference,
                client: clientId,
                items: payload.items,
                dateExacte: payload.dateExacte || now,
                remise: payload.remise || 0,
                total: payload.total,
                paymentMethod: payload.paymentMethod,
                vendeur: session?.user.id
            }
        ], { session: mongoSession })

        await History.create([{
            user: session?.user.id,
            actions: "create",
            resource: "sale",
            resourceId: sale[0]._id,
            description: `${session?.user.name} a enregistré une vente de ${payload.total} FCFA.`,
        }], { session: mongoSession })

        await mongoSession.commitTransaction()
        return NextResponse.json({
            message: "Vente enregistrée avec succès.",
            success: true,
            error: false,
            data: sale[0]
        }, { status: 201 })

    } catch (error) {
        await mongoSession.abortTransaction()
        console.error("Erreur lors de la création de la vente : ", error)

        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    } finally {
        mongoSession.endSession()
    }
})

export const GET = withAuth(async (req) => {
    try {
        await dbConnection()
        const session = await getServerSession(authOptions)
        const { role, id: userId } = session?.user

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const search = searchParams.get("search") || ""
        const paymentParam = searchParams.get("paymentMethod") || ""

        // 1) Filtre paymentMethod
        const paymentMethods = paymentParam
        ? paymentParam.split(",").map(s => s.trim()).filter(Boolean)
        : []

        // 2) Construction des clauses $or (reference, dateExacte, client, et pour l’admin vendeur)
        const orClauses = []
        if(search) {
            const regex = new RegExp(search, "i")

            // a) Recherche par référence
            orClauses.push({ reference: { $regex: regex } })

            // b) Recherche par date
            const parsed = Date.parse(search)
            if(!isNaN(parsed)) {
                const start = new Date(parsed);
                start.setHours(0, 0, 0, 0)
                const end = new Date(start)
                end.setDate(start.getDate() + 1)
                orClauses.push({ dateExacte: { $gte: start, $lt: end } })
            }

            // c) Recherche par client (nomComplet)
            const clientIds = await Client
              .find({ nomComplet: { $regex: regex }  })
              .distinct("_id");
            if(clientIds.length) {
                orClauses.push({ client: { $in: clientIds } })
            }

            // d) Recherche par vendeur (admin)
            if(role === "admin") {
                const vendorIds = await User
                    .find({ $or: [
                        { nom: { $regex: regex } },
                        { prenom: { $regex: regex } }
                    ]})
                   .distinct("_id")
                if(vendorIds.length) {
                    orClauses.push({ vendeur: { $in: vendorIds } })
                }
            }
        }

        // 3) Construction de la requête finale
        const filter = {}
        if(orClauses.length) {
            filter.$or = orClauses
        }
        if(paymentMethods.length) {
            filter.paymentMethod = { $in: paymentMethods }
        }

        //4) Limitation au vendeur connecté si pas admin 
        if(role !== "admin") {
            filter.vendeur = userId
        }

        // 5) Pagination + recupération des données
        const skip = (page - 1) * limit
        const [sales, total] = await Promise.all([
            Sale.find(filter)
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit),
            Sale.countDocuments(filter)
        ])

        return NextResponse.json({
            message: sales.length ? "Ventes récupérées avec succès." : "Aucune vente trouvée.",
            data: sales,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            success: true,
            error: false
        }, { status: 200, headers: { "Cache-Control": "no-cache" } })
        
    } catch (error) {
       return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})