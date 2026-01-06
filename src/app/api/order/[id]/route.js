import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Order from "@/models/Order.model";
import { withAuth } from "@/utils/withAuth"; // ✅ Déjà bon
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// ============================================
// GET - Détails d'une commande
// ============================================
export const GET = withAuth(
  async (req, context, session) => { // ✅ context + session
    try {
      await dbConnection();

      const { id } = await context.params; // ✅ Changé
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

      // Récupérer la commande avec tous les populate
      const order = await Order.findById(id)
        .populate({ path: "supplier", model: "Supplier" })
        .populate("createdBy", "nom prenom")
        .populate({ path: "items.product", model: "Product" })
        .lean();

      if (!order) {
        return NextResponse.json(
          {
            message: "Aucune commande trouvée avec cet ID",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          order,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de la commande:", error);
      return NextResponse.json(
        {
          message: "Erreur serveur lors de la récupération de la commande",
          success: false,
          error: true,
          details: error.message,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.ORDERS, // ✅ Flexible
    action: ACTIONS.READ,
  }
);