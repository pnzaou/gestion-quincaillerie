import dbConnection from "@/lib/db";
import History from "@/models/History.model";
import { withAuthAndRole } from "@/utils/withAuthAndRole";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const GET = withAuthAndRole(async (req) => {
    try {
        await dbConnection();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const businessId = searchParams.get("businessId");
        const skip = (page - 1) * limit;

        // Construction de la requête
        const query = {};

        // Filtre par période
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // Filtre par boutique
        if (businessId && businessId !== "all") {
            if (businessId === "global") {
                // Actions globales (sans boutique)
                query.business = null;
            } else {
                query.business = new mongoose.Types.ObjectId(businessId);
            }
        }

        const [histories, total] = await Promise.all([
            History.find(query)
                .populate("user", "nom prenom email")
                .populate("business", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            History.countDocuments(query)
        ]);

        // Sérialiser les données
        const serializedHistories = histories.map(history => ({
            id: history._id.toString(),
            user: history.user ? {
                id: history.user._id.toString(),
                name: `${history.user.prenom} ${history.user.nom}`,
                email: history.user.email
            } : null,
            business: history.business ? {
                id: history.business._id.toString(),
                name: history.business.name
            } : null,
            actions: history.actions,
            resource: history.resource || null,
            resourceId: history.resourceId || null,
            description: history.description || "",
            createdAt: history.createdAt.toISOString(),
        }));

        return NextResponse.json(
            {
                message: histories.length === 0 ? "Aucun historique trouvé." : "Historique récupéré avec succès.",
                data: serializedHistories,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                success: true,
                error: false
            },
            { status: 200, headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
        return NextResponse.json({
            message: "Erreur! Veuillez réessayer.",
            success: false,
            error: true
        }, { status: 500 });
    }
});