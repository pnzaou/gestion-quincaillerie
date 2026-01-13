import dbConnection from "@/lib/db";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { validateConvertQuotePayload } from "@/dtos/quote.dto";
import { convertQuoteToSale } from "@/services/quote.service";
import { HttpError } from "@/services/errors.service";

// ============================================
// POST - Convertir devis en vente
// ============================================
export const POST = withAuth(
  async (req, session) => {
    await dbConnection();
    const raw = await req.json();

    const { valid, errors, payload } = validateConvertQuotePayload(raw);
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
      const result = await convertQuoteToSale({ 
        quoteId: payload.quoteId,
        payments: payload.payments,
        status: payload.status,
        user: session.user 
      });

      return NextResponse.json(
        {
          message: "Devis converti en vente avec succès.",
          success: true,
          error: false,
          data: {
            quote: result.quote,
            sale: result.sale
          },
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("Erreur route POST /quote/convert :", err);
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
    resource: RESOURCES.SALES,
    action: ACTIONS.CREATE,
  }
);