import dbConnection from "@/lib/db"
import Client from "@/models/Client.model"
import { withAuth } from "@/utils/withAuth"
import { NextResponse } from "next/server"

export const POST = withAuth(async (req) => {
    try {
        await dbConnection()

        const { nomComplet, tel, email, adresse } = await req.json()
        
        if (!nomComplet.trim() || !tel.trim()) {
            return NextResponse.json({
                message: "Le nom et le numéro de téléphone du client sont obligatoires.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const existingEmail = await Client.findOne({ email })
        if (existingEmail) {
            return NextResponse.json({
                message: "Cet email est déjà utilisé.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const existingTel = await Client.findOne({ tel })
        if (existingTel) {
            return NextResponse.json({
                message: "Ce numéro de téléphone est déjà utilisé.",
                success: false,
                error: true
            }, { status: 400 })
        }

        const newClient = await Client.create({
            nomComplet: nomComplet.trim(),
            tel: tel.trim(),
            email: email.trim(),
            adresse: adresse.trim()
        })

        return NextResponse.json({
            message: "Client créé avec succès.",
            success: true,
            error: false,
            client: newClient
        }, { status: 201 })
        
    } catch (error) {
        console.error("Erreur lors de la création d'un client: ", error)

        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})