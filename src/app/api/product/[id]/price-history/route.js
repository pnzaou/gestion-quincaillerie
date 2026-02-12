import { NextResponse } from "next/server";
import dbConnection from "@/lib/db";
import PurchaseHistory from "@/models/PurchaseHistory.model";
import StockTransfer from "@/models/StockTransfer.model";
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

    // 1️⃣ Récupérer l'historique des achats (entrées)
    const purchases = await PurchaseHistory.find({
      product: id,
      business: businessId
    })
      .sort({ receivedDate: -1 })
      .lean();

    // 2️⃣ Récupérer les transferts SORTANTS (sorties)
    const outgoingTransfers = await StockTransfer.find({
      sourceBusiness: new mongoose.Types.ObjectId(businessId),
      status: { $in: ['validated', 'received'] },
      'items.sourceProductId': new mongoose.Types.ObjectId(id)
    })
      .populate('destinationBusiness', 'name')
      .sort({ transferDate: -1 })
      .lean();

    // 3️⃣ Transformer les transferts sortants en format d'historique
    const transferHistoryItems = [];
    
    for (const transfer of outgoingTransfers) {
      for (const item of transfer.items) {
        if (item.sourceProductId.toString() === id.toString()) {
          transferHistoryItems.push({
            receivedDate: transfer.transferDate,
            unitPrice: item.transferPrice,
            quantity: -item.quantity, // ✅ NÉGATIF pour indiquer une sortie
            totalCost: -(item.quantity * item.transferPrice), // ✅ NÉGATIF
            source: 'transfer_out', // ✅ Nouveau type
            notes: `Transfert vers ${transfer.destinationBusiness?.name || 'autre boutique'} - ${transfer.reference}`,
            transferReference: transfer.reference,
            destinationBusiness: transfer.destinationBusiness?.name
          });
        }
      }
    }

    // 4️⃣ Combiner et trier par date (plus récent en premier)
    const combinedHistory = [
      ...purchases.map(p => ({
        ...p,
        source: p.source || 'order', // Pour compatibilité avec ancien code
        isOutgoing: false
      })),
      ...transferHistoryItems.map(t => ({
        ...t,
        isOutgoing: true
      }))
    ].sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));

    return NextResponse.json({
      message: "Historique récupéré",
      success: true,
      error: false,
      history: combinedHistory
    });

  } catch (error) {
    console.error("Erreur route GET /product/[id]/price-history:", error);
    return NextResponse.json(
      { message: "Erreur serveur", success: false, error: true },
      { status: 500 }
    );
  }
});