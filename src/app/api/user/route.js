import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import { withAuthAndRole } from "@/lib/withAuthAndRole";
import User from "@/models/User.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const GET = withAuthAndRole(async (req) => {
    try {
        const session = await getServerSession(authOptions)
        
        await dbConnection()

        const user = await User.find({_id: { $ne: session.user.id }}, { password: 0 })
        
        return NextResponse.json(
            { 
                message: user.length === 0? "Aucun utilisateur enregistré." : "Utilisateurs récupérés avec succès",
                data: user,
                success: true,
                error: false
            },
            { status: 200, headers: { "Cache-Control": "no-store" } }
        )

    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs: ", error)
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 })
    }
})