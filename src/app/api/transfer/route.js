// ============================================
// /app/api/transfer/route.js
// POST - Créer un transfert
// GET - Liste des transferts
// ============================================

import dbConnection from "@/lib/db";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { createStockTransfer, getTransfers } from "@/services/stockTransfer.service";
import { HttpError } from "@/services/errors.service";

export const POST = withAuth(
  async (req, session) => {
    try {
      await dbConnection();
      
      const body = await req.json();
      const {
        sourceBusiness,
        destinationBusiness,
        items,
        sourceOrder,
        reason,
        expectedArrival,
        notes
      } = body;

      // Validation
      if (!sourceBusiness || !destinationBusiness) {
        return NextResponse.json(
          {
            message: "Boutiques source et destination requises",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          {
            message: "Au moins un article requis",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      // Créer le transfert
      const result = await createStockTransfer({
        sourceBusiness,
        destinationBusiness,
        items,
        sourceOrder: sourceOrder || null,
        reason: reason || 'other',
        expectedArrival: expectedArrival ? new Date(expectedArrival) : null,
        notes: notes || null,
        user: session.user
      });

      return NextResponse.json(
        {
          message: "Transfert créé avec succès",
          success: true,
          error: false,
          data: result
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Erreur création transfert:", error);
      
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
          message: error.message || "Erreur lors de la création du transfert",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.ORDERS, // Ou créer RESOURCES.TRANSFERS
    action: ACTIONS.CREATE,
  }
);

export const GET = withAuth(
  async (req, session) => {
    try {
      await dbConnection();
      
      const { searchParams } = new URL(req.url);
      const businessId = searchParams.get('businessId');
      const type = searchParams.get('type') || 'all'; // 'sent', 'received', 'all'
      const status = searchParams.get('status') || null;
      const limit = parseInt(searchParams.get('limit')) || 20;
      const page = parseInt(searchParams.get('page')) || 1;

      if (!businessId) {
        return NextResponse.json(
          {
            message: "ID de boutique requis",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const result = await getTransfers({
        businessId,
        type,
        status,
        limit,
        page
      });

      return NextResponse.json(
        {
          message: "Transferts récupérés avec succès",
          success: true,
          error: false,
          data: result.transfers,
          pagination: result.pagination
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur récupération transferts:", error);
      return NextResponse.json(
        {
          message: error.message || "Erreur lors de la récupération des transferts",
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