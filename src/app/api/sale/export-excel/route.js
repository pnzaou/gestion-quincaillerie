import dbConnection from "@/lib/db";
import Sale from "@/models/Sale.model";
import Payment from "@/models/Payment.model";
import { withAuth } from "@/utils/withAuth";
import { RESOURCES, ACTIONS } from "@/lib/permissions";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import * as XLSX from "xlsx";

// Traduction des statuts (audit-friendly)
const STATUS_LABELS = {
  paid: "Réglé",
  partial: "Acompte versé",
  pending: "Dette",
  cancelled: "Annulée",
};

// ============================================
// GET - Export ventes AUDIT Excel
// ============================================
export const GET = withAuth(
  async (req, session) => {
    try {
      await dbConnection();

      const { searchParams } = new URL(req.url);
      const businessId = searchParams.get("businessId");

      if (!businessId) {
        return NextResponse.json(
          { message: "ID de la boutique manquant.", success: false, error: true },
          { status: 400 }
        );
      }

      const businessObjectId = new mongoose.Types.ObjectId(businessId);

      const sales = await Sale.find({ business: businessObjectId })
        .populate("client", "nomComplet tel")
        .populate("vendeur", "nom prenom")
        .populate("items.product", "nom")
        .sort({ dateExacte: -1 });

      if (!sales.length) {
        return NextResponse.json(
          { message: "Aucune vente trouvée.", success: false, error: true },
          { status: 404 }
        );
      }

      // =============================
      // FEUILLES D'AUDIT
      // =============================
      const ventesSheet = [];
      const produitsSheet = [];
      const paiementsSheet = [];

      for (const sale of sales) {
        const payments = await Payment.find({ sale: sale._id }).sort({ date: 1 });

        const totalPaye = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalNet = sale.total - (sale.remise || 0);

        // -------- Feuille VENTES --------
        ventesSheet.push({
          Référence: sale.reference,
          Date: new Date(sale.dateExacte).toLocaleDateString("fr-FR"),
          Client: sale.client?.nomComplet || "Client anonyme",
          Téléphone: sale.client?.tel || "",
          Vendeur: `${sale.vendeur.nom} ${sale.vendeur.prenom}`,
          "Total Brut": sale.total,
          Remise: sale.remise || 0,
          "Total Net": totalNet,
          "Total Payé": totalPaye,
          "Reste à payer": sale.amountDue || 0,
          Statut: STATUS_LABELS[sale.status] || sale.status,
          "Nombre Produits": sale.items.length,
          "Nombre Paiements": payments.length,
        });

        // -------- Feuille PRODUITS --------
        sale.items.forEach((item) => {
          produitsSheet.push({
            "Référence Vente": sale.reference,
            Date: new Date(sale.dateExacte).toLocaleDateString("fr-FR"),
            Produit: item.product?.nom || "Produit supprimé",
            Quantité: item.quantity,
            "Prix Unitaire": item.price,
            "Total Ligne": item.quantity * item.price,
          });
        });

        // -------- Feuille PAIEMENTS --------
        payments.forEach((p) => {
          paiementsSheet.push({
            "Référence Vente": sale.reference,
            "Date Paiement": new Date(p.date).toLocaleDateString("fr-FR"),
            Méthode: p.method,
            Montant: p.amount,
          });
        });
      }

      // =============================
      // CRÉATION CLASSEUR EXCEL
      // =============================
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(ventesSheet),
        "Ventes"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(produitsSheet),
        "Produits_Vendus"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(paiementsSheet),
        "Paiements"
      );

      const buffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
      });

      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Disposition": "attachment; filename=ventes_audit.xlsx",
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    } catch (error) {
      console.error("Erreur export audit ventes :", error);
      return NextResponse.json(
        { message: "Erreur ! Veuillez réessayer.", success: false, error: true },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.SALES,
    action: ACTIONS.EXPORT,
  }
);
