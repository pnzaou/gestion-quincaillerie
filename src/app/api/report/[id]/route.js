import dbConnection from "@/lib/db";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";
import Report from "@/models/Report.model";
import mongoose from "mongoose";

// ============================================
// GET - Détails d'un rapport
// ============================================
export const GET = withAuth(
  async (req, context, session) => {
    await dbConnection();

    try {
      const { id } = await context.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            message: "ID de rapport invalide",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const report = await Report.findById(id)
        .populate("business", "name")
        .populate("generatedBy", "nom prenom email")
        .populate("data.sales.topProducts.product", "nom reference")
        .populate("data.inventory.topValueProducts.product", "nom reference")
        .populate("data.clients.topClients.client", "nomComplet tel email")
        .populate("data.orders.topSuppliers.supplier", "nom tel")
        .populate("data.categories.category", "nom")
        .lean();

      if (!report) {
        return NextResponse.json(
          {
            message: "Rapport non trouvé",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          error: false,
          data: report,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur GET /report/[id]:", error);
      return NextResponse.json(
        {
          message: "Erreur lors de la récupération du rapport",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.REPORTS,
    action: ACTIONS.READ,
  }
);

// ============================================
// PATCH - Mettre à jour un rapport (status, notes)
// ============================================
export const PATCH = withAuth(
  async (req, context, session) => {
    await dbConnection();

    try {
      const { id } = await context.params;
      const body = await req.json();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            message: "ID de rapport invalide",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const report = await Report.findById(id);

      if (!report) {
        return NextResponse.json(
          {
            message: "Rapport non trouvé",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      // Mise à jour autorisée
      const allowedUpdates = ["status", "notes"];
      Object.keys(body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          report[key] = body[key];
        }
      });

      await report.save();

      return NextResponse.json(
        {
          message: "Rapport mis à jour avec succès",
          success: true,
          error: false,
          data: report,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur PATCH /report/[id]:", error);
      return NextResponse.json(
        {
          message: "Erreur lors de la mise à jour du rapport",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.REPORTS,
    action: ACTIONS.UPDATE,
  }
);

// ============================================
// DELETE - Supprimer un rapport
// ============================================
export const DELETE = withAuth(
  async (req, context, session) => {
    await dbConnection();

    try {
      const { id } = await context.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            message: "ID de rapport invalide",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const report = await Report.findByIdAndDelete(id);

      if (!report) {
        return NextResponse.json(
          {
            message: "Rapport non trouvé",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "Rapport supprimé avec succès",
          success: true,
          error: false,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur DELETE /report/[id]:", error);
      return NextResponse.json(
        {
          message: "Erreur lors de la suppression du rapport",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.REPORTS,
    action: ACTIONS.DELETE,
  }
);