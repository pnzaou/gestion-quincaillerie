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