import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import { withAuthAndRole } from "@/utils/withAuthAndRole";
import User from "@/models/User.model";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const GET = withAuthAndRole(async (req) => {
    try {
        const session = await getServerSession(authOptions)
        await dbConnection()

        const { searchParams } = new URL(req.url)
        console.log(searchParams)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "5")
        const search = searchParams.get("search") || ""
        const skip = (page - 1) * limit

        const query = search
        ? {
            _id: { $ne: session.user.id },
            $or: [
                { nom: { $regex: search, $options: "i" } },
                { prenom: { $regex: search, $options: "i" } }
            ]
        }
        : { _id: { $ne: session.user.id } };

        const [users, total] = await Promise.all([
            User.find(query, { password: 0 })
            .skip(skip)
            .limit(limit),
           User.countDocuments(query)
        ])
        
        return NextResponse.json(
            { 
                message: users.length === 0? "Aucun utilisateur trouvé." : "Utilisateurs récupérés avec succès",
                data: users,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
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