import dbConnection from "@/lib/db";
import Client from "@/models/Client.model";
import { getAccountByClientId } from "@/services/account.service";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req, { params }) => {
    try {
        await dbConnection();

        const {id} = await params;
        if(!id || !mongoose.Types.ObjectId.isValid(id)){
            return NextResponse.json({ 
                message: "Veuillez fournir un ID valide", 
                success: false, 
                error: true 
            }, { status: 400 })
        }

        const client = await Client.findById(id);
        if(!client){
            return NextResponse.json({
                message: "Aucun client trouvé pour cet ID",
                success: false,
                error: true
            },{ status: 404 })
        }

        const account = await getAccountByClientId(id);

        return NextResponse.json({
            message: "Client récupéré avec succès",
            success: true,
            error: false,
            data: {
                client,
                account
            }
        }, { status: 200 })

    } catch (error) {
        console.error("Erreur lors de la récupération des infos du client: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})