import dbConnection from "@/lib/db";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { createQuote } from "@/services/quote.service";
import { HttpError } from "@/services/errors.service";
import { validateQuotePayload } from "@/dtos/quote.dto";

// ============================================
// POST - Créer un devis
// ============================================
export const POST = withAuth(
  async (req, session) => {
    await dbConnection();
    const raw = await req.json();

    if (!raw.businessId) {
      return NextResponse.json(
        {
          message: "ID de la boutique manquant.",
          success: false,
          error: true,
        },
        { status: 400 }
      );
    }

    const { valid, errors, payload } = validateQuotePayload(raw);
    if (!valid) {
      return NextResponse.json(
        {
          message: "Données invalides",
          errors,
          success: false,
          error: true,
        },
        { status: 400 }
      );
    }

    try {
      const quote = await createQuote({ payload, user: session.user });
      return NextResponse.json(
        {
          message: "Devis créé avec succès.",
          success: true,
          error: false,
          data: quote,
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Erreur route POST /quote :", err);
      if (err instanceof HttpError || (err.status && err.message)) {
        return NextResponse.json(
          { message: err.message, success: false, error: true },
          { status: err.status || 400 }
        );
      }
      return NextResponse.json(
        { message: "Erreur! Veuillez réessayer.", success: false, error: true },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.SALES, // Même permission que ventes
    action: ACTIONS.CREATE,
  }
);

// ============================================
// GET - Liste des devis
// ============================================
export const GET = withAuth(
  async (req, session) => {
    await dbConnection();

    try {
      const { searchParams } = new URL(req.url);
      const businessId = searchParams.get("businessId");
      const status = searchParams.get("status");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");

      if (!businessId) {
        return NextResponse.json(
          { message: "businessId requis", success: false, error: true },
          { status: 400 }
        );
      }

      const query = { business: businessId };
      if (status) query.status = status;

      const Quote = (await import("@/models/Quote.model")).default;

      const [quotes, total] = await Promise.all([
        Quote.find(query)
          .populate("client", "nomComplet tel email")
          .populate("createdBy", "nom prenom")
          .populate("items.product", "nom reference")
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip((page - 1) * limit)
          .lean(),
        Quote.countDocuments(query)
      ]);

      return NextResponse.json({
        success: true,
        error: false,
        data: quotes,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (error) {
      console.error("Erreur GET /quote:", error);
      return NextResponse.json(
        { message: "Erreur récupération devis", success: false, error: true },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.SALES,
    action: ACTIONS.LIST,
  }
);