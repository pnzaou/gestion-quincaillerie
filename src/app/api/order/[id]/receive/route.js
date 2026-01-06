import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Order from "@/models/Order.model";
import { receiveOrder } from "@/services/order.service";
import { withAuth } from "@/utils/withAuth"; // ✅ Déjà bon
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// ============================================
// POST - Recevoir une commande
// ============================================
export const POST = withAuth(
  async (req, context, session) => { // ✅ context + session
    try {
      await dbConnection();
      
      // ✅ Plus besoin de getServerSession
      const { id } = await context.params; // ✅ Changé
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
        user: session.user, // ✅ Utilise session directement
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
  },
  {
    resource: RESOURCES.ORDERS, // ✅ Flexible (ou ACTIONS.RECEIVE si existe)
    action: ACTIONS.UPDATE, // Recevoir = mise à jour
  }
);