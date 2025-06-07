import authOptions from "@/lib/auth"
import dbConnection from "@/lib/db"
import Client from "@/models/Client.model"
import Product from "@/models/Product.model"
import Sale from "@/models/Sale.model"
import { withAuth } from "@/utils/withAuth"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export const POST = withAuth(async (req) => {
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()
    
    try {
        const session = await getServerSession(authOptions)
        await dbConnection()
        const payload = await req.json()


        const now = new Date(payload.dateExacte || Date.now())
        const D = String(now.getDate()).padStart(2, "0")
        const M = String(now.getMonth() + 1).padStart(2, "0")
        const Y = now.getFullYear()
        const prefix = `VENTE-${Y}${M}${D}-`

        const count = await Sale.countDocuments({
            reference: { $regex: `^${prefix}\\d{3}$` }
        }).session(mongoSession)

        const seq = String(count + 1).padStart(3, "0")
        const reference = `${prefix}${seq}`

        let clientId = null
        if (payload.client) {
            if(payload.client._id) {
                clientId = payload.client._id
            } else {
                const newClient = await Client.create([
                    {
                        nomComplet: payload.client.nomComplet,
                        tel: payload.client.tel,
                        email: payload.client.email,
                        adresse: payload.client.adresse
                    }
                ], { session: mongoSession })
                clientId = newClient[0]._id
            }
        }

        for (const item of payload.items) {
            if (!mongoose.Types.ObjectId.isValid(item.product)) {
                return NextResponse.json({
                    message: "Veuillez fournir un ID de produit valide.",
                    success: false,
                    error: true
                }, { status: 400 })
            }
            const prod = await Product.findById(item.product).session(mongoSession)
            if (!prod) {
                return NextResponse.json({
                    message: "Produit non trouvé.",
                    success: false,
                    error: true
                }, { status: 404 })
            }
            prod.quantity -= item.quantity
            if (prod.quantity < 0) {
                return NextResponse.json({
                    message: "Quantité en stock insuffisante pour le produit : " + prod.nom,
                    success: false,
                    error: true
                }, { status: 400 })
            }
            await prod.save({ session: mongoSession })
        }

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
            message: "Vente créée avec succès.",
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