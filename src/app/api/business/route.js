import { NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuth"; // ✅ Changé
import BusinessModel from "@/models/Business.model";
import dbConnection from "@/lib/db";

// ============================================
// GET - Boutiques de l'admin connecté
// ============================================
export const GET = withAuth(
  async (req, session) => { // ✅ session en paramètre
    try {
      await dbConnection();
      
      // ✅ Plus besoin de getServerSession
      const { id: ownerId } = session.user;

      const businesses = await BusinessModel.find({ owner: ownerId })
        .select("_id name")
        .sort({ name: 1 });

      return NextResponse.json(
        {
          businesses,
          success: true,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("GET /api/business :", error);
      return NextResponse.json(
        {
          message: "Erreur lors de la récupération des boutiques.",
          success: false,
        },
        { status: 500 }
      );
    }
  },
  {
    roles: ["admin"], // ✅ ADMIN UNIQUEMENT (strict)
  }
);