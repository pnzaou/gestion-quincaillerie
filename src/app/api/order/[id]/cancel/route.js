import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Order from "@/models/Order.model";
import { updateOrderStatus } from "@/services/order.service";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const PATCH = withAuth(async (req, { params }) => {
  try {
    await dbConnection();
    const session = await getServerSession(authOptions);

    const { id } = await params;

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

    // Vérifier que la commande peut être annulée
    if (order.status === "completed") {
      return NextResponse.json(
        {
          message: "Impossible d'annuler une commande déjà terminée",
          success: false,
          error: true,
        },
        { status: 400 }
      );
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        {
          message: "Cette commande est déjà annulée",
          success: false,
          error: true,
        },
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    await updateOrderStatus({
      orderId: id,
      status: "cancelled",
      user: session?.user,
      businessId: order.business,
    });

    return NextResponse.json(
      {
        message: "Commande annulée avec succès",
        success: true,
        error: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'annulation de la commande:", error);
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