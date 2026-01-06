import dbConnection from "@/lib/db";
import Sale from "@/models/Sale.model";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import * as XLSX from "xlsx";

// ============================================
// GET - Exporter les ventes en Excel
// ============================================
export const GET = withAuth(
  async (req, session) => { // ✅ session en paramètre
    try {
      await dbConnection();

      const { searchParams } = new URL(req.url);
      const businessId = searchParams.get("businessId");

      if (!businessId) {
        return NextResponse.json(
          {
            message: "ID de la boutique manquant.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const businessObjectId = new mongoose.Types.ObjectId(businessId);

      const sales = await Sale.find({ business: businessObjectId })
        .populate("client", "nomComplet tel")
        .populate("vendeur", "nom prenom")
        .sort({ createdAt: -1 });

      if (!sales || sales.length === 0) {
        return NextResponse.json(
          {
            message: "Aucune vente trouvée.",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      const rows = sales.map((sale) => ({
        Référence: sale.reference,
        Date: new Date(sale.dateExacte).toLocaleDateString("fr-FR"),
        Client: sale.client ? sale.client.nomComplet : "Client anonyme",
        Téléphone: sale.client ? sale.client.tel : "",
        Vendeur: `${sale.vendeur.nom} ${sale.vendeur.prenom}`,
        Total: sale.total,
        Remise: sale.remise || 0,
        MontantDû: sale.amountDue || 0,
        Statut: sale.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ventes");

      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Disposition": "attachment; filename=ventes.xlsx",
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'exportation des ventes en Excel:", error);
      return NextResponse.json(
        {
          message: "Erreur ! Veuillez réessayer.",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.SALES, // ✅ Flexible
    action: ACTIONS.EXPORT,
  }
);