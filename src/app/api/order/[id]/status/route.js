import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Order from "@/models/Order.model";
import { updateOrderStatus } from "@/services/order.service";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ORDER_STATUSES } from "@/dtos/order.dto";

export const PATCH = withAuth(async (req, { params }) => {
  try {
    await dbConnection();
    const session = await getServerSession(authOptions);

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

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

    if (!status || !ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          message: "Statut invalide",
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

    // Mettre à jour le statut
    await updateOrderStatus({
      orderId: id,
      status,
      user: session?.user,
      businessId: order.business,
    });

    return NextResponse.json(
      {
        message: "Statut mis à jour avec succès",
        success: true,
        error: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
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