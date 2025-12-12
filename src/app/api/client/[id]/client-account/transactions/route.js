import { listTransactions } from "@/services/account.service";
import { withAuth } from "@/utils/withAuth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id: clientId } = await params;
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({
        message: "Paramètres de pagination invalides",
        success: false,
        error: true
      }, { status: 400 });
    }

    const transactions = await listTransactions({ clientId, limit, page });

    return NextResponse.json({
      data: {
        transactions,
        pagination: {
          page,
          limit
        }
      },
      success: true,
      error: false
    }, { status: 200 });
    
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des transactions:", error);
    return NextResponse.json({
      message: error.message || "Erreur! Veuillez réessayer.",
      success: false,
      error: true
    }, { status: 500 });
  }
});