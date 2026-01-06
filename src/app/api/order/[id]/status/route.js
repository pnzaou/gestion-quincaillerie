import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Order from "@/models/Order.model";
import { updateOrderStatus } from "@/services/order.service";
import { withAuth } from "@/utils/withAuth"; // ✅ Déjà bon
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { ORDER_STATUSES } from "@/dtos/order.dto";

// ============================================
// PATCH - Changer statut commande
// ============================================
export const PATCH = withAuth(
  async (req, context, session) => { // ✅ context + session
    try {
      await dbConnection();
      
      // ✅ Plus besoin de getServerSession
      const { id } = await context.params; // ✅ Changé
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
        user: session.user, // ✅ Utilise session directement
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
  },
  {
    resource: RESOURCES.ORDERS, // ✅ Flexible
    action: ACTIONS.UPDATE,
  }
);