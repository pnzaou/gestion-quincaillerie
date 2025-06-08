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

export const POST = withAuth(async (req) => {
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()
    
    try {
        const session = await getServerSession(authOptions)
        await dbConnection()
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

        await mongoSession.commitTransaction()
        mongoSession.endSession()

        return NextResponse.json({
            message: "Vente enregistrée avec succès.",
            success: true,
            error: false,
            data: sale[0]
        }, { status: 201 })

    } catch (error) {
        await mongoSession.abortTransaction()
        mongoSession.endSession()
        console.error("Erreur lors de la création de la vente : ", error)

        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})