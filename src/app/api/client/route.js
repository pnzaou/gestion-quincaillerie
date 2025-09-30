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

        const clientData = {
            nomComplet: nomComplet.trim(),
            tel: tel.trim(),
            adresse: adresse.trim() || ""
        }
        if(email && email.trim()) {
            clientData.email = email.trim()
        }

        const [newClient] = await Client.create([
            clientData
        ], { session: mongoSession })

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

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "0")
        const search = searchParams.get("search") || ""
        const skip = (page - 1) * limit

        const query = search
        ? { nomComplet: { $regex: search, $options: "i" } }
        : {}

        const [clients, total] = await Promise.all([
            Client.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
            Client.countDocuments(query)
        ])

        return NextResponse.json({
            message: clients.length === 0? "Aucun client enregistré." : "Clients récupérés avec succès.",
            data: clients,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            success: true,
            error: false,
        }, { status: 200, headers: { "Cache-Control": "no-store" } })
    } catch (error) {
        console.error("Erreur lors de la récupération des clients: ", error)

        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})