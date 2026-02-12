import { NextResponse } from "next/server";
import dbConnection from "@/lib/db";
import StockTransfer from "@/models/StockTransfer.model";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";

export const GET = withAuth(async (req, context) => {
  try {
    await dbConnection();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "ID commande invalide", success: false },
        { status: 400 }
      );
    }

    // Trouver tous les transferts liés à cette commande
    const transfers = await StockTransfer.find({
      sourceOrder: id
    })
      .populate('destinationBusiness', 'name')
      .populate('items.sourceProductId', 'nom reference')
      .sort({ transferDate: -1 })
      .lean();

    return NextResponse.json({
      message: "Transferts récupérés",
      success: true,
      transfers
    });

  } catch (error) {
    console.error("Erreur GET /order/[id]/transfers:", error);
    return NextResponse.json(
      { message: "Erreur serveur", success: false },
      { status: 500 }
    );
  }
});