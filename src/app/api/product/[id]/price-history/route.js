import { NextResponse } from "next/server";
import dbConnection from "@/lib/db";
import PurchaseHistory from "@/models/PurchaseHistory.model";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";

export const GET = withAuth(async (req, { params }) => {
  try {
    await dbConnection();

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { message: "businessId manquant", success: false, error: true },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "ID produit invalide", success: false, error: true },
        { status: 400 }
      );
    }

    // Récupérer l'historique des achats
    const history = await PurchaseHistory.find({
      product: id,
      business: businessId
    })
      .sort({ receivedDate: -1 })
      .lean();

    return NextResponse.json({
      message: "Historique récupéré",
      success: true,
      error: false,
      history
    });

  } catch (error) {
    console.error("Erreur route GET /product/[id]/price-history:", error);
    return NextResponse.json(
      { message: "Erreur serveur", success: false, error: true },
      { status: 500 }
    );
  }
});