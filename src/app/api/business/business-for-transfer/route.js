import { NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuth";
import Business from "@/models/Business.model";
import dbConnection from "@/lib/db";

export const GET = withAuth(
  async (req, session) => {
    try {
      await dbConnection();

      // Récupérer toutes les boutiques de l'admin connecté
      const businesses = await Business.find()
      .select('_id name')
      .lean();

      return NextResponse.json(
        {
          message: "Boutiques récupérées avec succès",
          success: true,
          data: businesses
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("GET /api/business-for-transfer :", error);
      return NextResponse.json(
        {
          message: "Erreur lors de la récupération des boutiques",
          success: false,
        },
        { status: 500 }
      );
    }
  },
  {
    roles: ["admin", "gerant"],
  }
);