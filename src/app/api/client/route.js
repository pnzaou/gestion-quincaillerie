import authOptions from "@/lib/auth"
import dbConnection from "@/lib/db"
import Client from "@/models/Client.model"
import History from "@/models/History.model"
import { withAuth } from "@/utils/withAuth"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export const POST = withAuth(async (req) => {
    await dbConnection()
    const mongoSession = await mongoose.startSession()
    mongoSession.startTransaction()
    try {
        const session = await getServerSession(authOptions)
        const { name, id: userId } = session.user

        const { nomComplet = "", tel = "", email = "", adresse = "" } = await req.json()
        
        if (!nomComplet.trim() || !tel.trim()) {
            await mongoSession.abortTransaction();
            return NextResponse.json({
                message: "Le nom et le numéro de téléphone du client sont obligatoires.",
                success: false,
                error: true
            }, { status: 400 })
        }

        if(email && email.trim()) {
            const existingEmail = await Client.findOne({ email }).session(mongoSession)
            if (existingEmail) {
                await mongoSession.abortTransaction();
                return NextResponse.json({
                    message: "Cet email est déjà utilisé.",
                    success: false,
                    error: true
                }, { status: 400 })
            }
        }

        const existingTel = await Client.findOne({ tel }).session(mongoSession)
        if (existingTel) {
            await mongoSession.abortTransaction();
            return NextResponse.json({
                message: "Ce numéro de téléphone est déjà utilisé.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const [newClient] = await Client.create([{
            nomComplet: nomComplet.trim(),
            tel: tel.trim(),
            email: email.trim() || "",
            adresse: adresse.trim() || ""
        }], { session: mongoSession })

        await History.create([{
            user: userId,
            actions: "create",
            resource: "client",
            description: `${name} a créé le client ${newClient.nomComplet}.`,
            resourceId: newClient._id
        }], { session: mongoSession })

        await mongoSession.commitTransaction()
        return NextResponse.json({
            message: "Client créé avec succès.",
            success: true,
            error: false,
            client: newClient
        }, { status: 201 })
        
    } catch (error) {
        await mongoSession.abortTransaction()
        console.error("Erreur lors de la création d'un client: ", error)

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

        const clients = await Client.find()

        return NextResponse.json({
            message: "Clients récupérés avec succès.",
            success: true,
            error: false,
            data: clients
        }, { status: 200 })
    } catch (error) {
        console.error("Erreur lors de la récupération des clients: ", error)

        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})