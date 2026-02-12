// ============================================
// /app/api/transfer/[id]/route.js
// PATCH - Valider ou annuler un transfert
// GET - Détails d'un transfert
// ============================================

import dbConnection from "@/lib/db";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";
import StockTransfer from "@/models/StockTransfer.model";
import { validateTransfer, cancelTransfer } from "@/services/stockTransfer.service";
import { HttpError } from "@/services/errors.service";
import mongoose from "mongoose";

export const GET = withAuth(
  async (req, context, session) => {
    try {
      await dbConnection();
      
      const { id } = await context.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            message: "ID de transfert invalide",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const transfer = await StockTransfer.findById(id)
        .populate('sourceBusiness', 'name')
        .populate('destinationBusiness', 'name')
        .populate('items.sourceProductId', 'nom reference image')
        .populate('items.destinationProductId', 'nom reference image')
        .populate('createdBy', 'nom prenom')
        .populate('validatedBy', 'nom prenom')
        .populate('receivedBy', 'nom prenom')
        .populate('destinationOrder')
        .lean();

      if (!transfer) {
        return NextResponse.json(
          {
            message: "Transfert introuvable",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "Transfert récupéré avec succès",
          success: true,
          error: false,
          data: transfer
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur récupération transfert:", error);
      return NextResponse.json(
        {
          message: error.message || "Erreur lors de la récupération du transfert",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.ORDERS,
    action: ACTIONS.READ,
  }
);

export const PATCH = withAuth(
  async (req, context, session) => {
    try {
      await dbConnection();
      
      const { id } = await context.params;
      const body = await req.json();
      const { action, reason } = body; // action: 'validate' ou 'cancel'

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            message: "ID de transfert invalide",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      if (!action || !['validate', 'cancel'].includes(action)) {
        return NextResponse.json(
          {
            message: "Action invalide. Utilisez 'validate' ou 'cancel'",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      let updatedTransfer;

      if (action === 'validate') {
        updatedTransfer = await validateTransfer(id, session.user.id);
        
        return NextResponse.json(
          {
            message: "Transfert validé avec succès",
            success: true,
            error: false,
            data: updatedTransfer
          },
          { status: 200 }
        );
      } else if (action === 'cancel') {
        updatedTransfer = await cancelTransfer(id, session.user.id, reason);
        
        return NextResponse.json(
          {
            message: "Transfert annulé avec succès",
            success: true,
            error: false,
            data: updatedTransfer
          },
          { status: 200 }
        );
      }

    } catch (error) {
      console.error("Erreur mise à jour transfert:", error);
      
      if (error instanceof HttpError) {
        return NextResponse.json(
          {
            message: error.message,
            success: false,
            error: true,
          },
          { status: error.status }
        );
      }

      return NextResponse.json(
        {
          message: error.message || "Erreur lors de la mise à jour du transfert",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.ORDERS,
    action: ACTIONS.UPDATE,
  }
);