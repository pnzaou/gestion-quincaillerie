import Client from "@/models/Client.model"
import { NextResponse } from "next/server"

export async function getOrCreateClient(clientData, session) {
    if(!clientData) return null

    if(clientData._id) {
        return clientData._id
    }

    if(!clientData.nomComplet.trim() || !clientData.tel.trim()) {
        return NextResponse.json({
            message: "Le nom et le numéro de téléphone du client sont obligatoires.",
            success: false,
            error: true
        }, { status: 400 })
    }

    if(clientData.email) {
        const existingEmail = await Client.findOne({ email: clientData.email })
        if (existingEmail) {
            return NextResponse.json({
                message: "L'email du client est déjà utilisé.",
                success: false,
                error: true
            }, { status: 400 })
        }
    }

    const existingTel = await Client.findOne({ tel: clientData.tel })
    if (existingTel) {
        return NextResponse.json({
            message: "Le numéro de téléphone du client est déjà utilisé.",
            success: false,
            error: true
        }, { status: 400 })
    }

    const [newClient] = await Client.create([{
        nomComplet: clientData.nomComplet.trim(),
        tel: clientData.tel.trim(),
        email: clientData.email?.trim(),
        adresse: clientData.adresse?.trim()
    }], { session })

    return newClient._id
}