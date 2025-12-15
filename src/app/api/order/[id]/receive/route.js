import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Order from "@/models/Order.model";
import { receiveOrder } from "@/services/order.service";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const POST = withAuth(async (req, { params }) => {
  try {
    await dbConnection();
    const session = await getServerSession(authOptions);

    const { id } = await params;
    const body = await req.json();
    const { items } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          message: "ID de commande invalide",
          success: false,
          error: true,
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          message: "Aucun produit à recevoir",
          success: false,
          error: true,
        },
        { status: 400 }
      );
    }

    // Récupérer la commande pour obtenir le businessId
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        {
          message: "Commande introuvable",
          success: false,
          error: true,
        },
        { status: 404 }
      );
    }

    // Recevoir la commande
    const updatedOrder = await receiveOrder({
      orderId: id,
      items,
      user: session?.user,
      businessId: order.business,
    });

    return NextResponse.json(
      {
        message: "Réception enregistrée avec succès",
        success: true,
        error: false,
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la réception de la commande:", error);
    return NextResponse.json(
      {
        message: error.message || "Erreur! Veuillez réessayer.",
        success: false,
        error: true,
      },
      { status: 500 }
    );
  }
});