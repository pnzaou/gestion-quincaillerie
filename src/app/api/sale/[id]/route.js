import dbConnection from "@/lib/db";
import Payment from "@/models/Payment.model";
import Sale from "@/models/Sale.model";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req, { params }) => {
  try {
    await dbConnection();

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          message: "Veuillez fournir un ID valide",
          success: false,
          error: true,
        },
        { status: 400 }
      );
    }

    // Récupérer la vente en population client, vendeur et product dans items
    const sale = await Sale.findById(id)
      .populate({ path: "client", model: "Client" })
      .populate("vendeur", "nom prenom")
      .populate({ path: "items.product", model: "Product" })
      .lean();

    if (!sale) {
      return NextResponse.json(
        {
          message: "Aucune vente trouvée avec cet ID",
          success: false,
          error: true,
        },
        { status: 404 }
      );
    }

    // Récupérer les paiements liés à cette vente
    const payments = await Payment.find({ sale: id })
      .sort({ createdAt: 1 })
      .lean();

    // Optionnel : garantir que chaque item a bien un objet product (si produit supprimé côté catalogue)
    sale.items = sale.items.map((it) => {
      if (!it.product) {
        // si product supprimé, garder l'info minimale déjà présente dans l'item (si tu en as stocké une copie)
        return it;
      }
      return it;
    });

    return NextResponse.json(
      {
        success: true,
        sale,
        payments,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erreur serveur lors de la récupération de la vente",
        success: false,
        error: true,
        details: error.message,
      },
      { status: 500 }
    );
  }
});