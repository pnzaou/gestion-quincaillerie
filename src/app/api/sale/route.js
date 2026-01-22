import dbConnection from "@/lib/db";
import Sale from "@/models/Sale.model";
import { withAuth } from "@/utils/withAuth"; // ✅ Déjà bon
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import { NextResponse } from "next/server";
import Client from "@/models/Client.model";
import User from "@/models/User.model";
import { validateSalePayload } from "@/dtos/sale.dto";
import { createSale } from "@/services/sale.service";
import { HttpError } from "@/services/errors.service";
import mongoose from "mongoose";
import Payment from "@/models/Payment.model";

// ============================================
// POST - Créer une vente
// ============================================
export const POST = withAuth(
  async (req, session) => { // ✅ session en paramètre
    await dbConnection();
    const raw = await req.json();

    // ✅ Vérifier businessId avant validation
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

    const { valid, errors, payload } = validateSalePayload(raw);
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

    // ✅ Plus besoin de getServerSession
    try {
      const sale = await createSale({ payload, user: session.user });

      const completeSale = await Sale.findById(sale._id)
        .populate({ path: "client", model: "Client" })
        .populate("vendeur", "nom prenom email")
        .populate({ path: "items.product", model: "Product" })
        .lean();

      const payments = await Payment.find({ sale: sale._id })
        .sort({ createdAt: 1 })
        .lean();
      
      return NextResponse.json(
        {
          message: "Vente enregistrée avec succès.",
          success: true,
          error: false,
          sale: completeSale,
          payments,
        },
        { status: 201 }
      );
    } catch (err) {
      console.error("Erreur route POST /sales :", err);
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
    resource: RESOURCES.SALES, // ✅ Flexible (overrides possibles)
    action: ACTIONS.CREATE,
  }
);

// ============================================
// GET - Liste des ventes
// ============================================
export const GET = withAuth(
  async (req, session) => { // ✅ session en paramètre
    try {
      await dbConnection();
      
      // ✅ Plus besoin de getServerSession
      const { role, id: userId } = session.user;

      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const search = searchParams.get("search") || "";
      const statusParam = searchParams.get("status") || "";
      const businessId = searchParams.get("businessId");

      // ✅ Vérifier businessId
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

      // 1) Filtre status
      const statuses = statusParam
        ? statusParam
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      // 2) Construction des clauses $or (reference, dateExacte, client, et pour l'admin vendeur)
      const orClauses = [];
      if (search) {
        const regex = new RegExp(search, "i");

        // a) Recherche par référence
        orClauses.push({ reference: { $regex: regex } });

        // b) Recherche par date
        const parsed = Date.parse(search);
        if (!isNaN(parsed)) {
          const start = new Date(parsed);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(start.getDate() + 1);
          orClauses.push({ dateExacte: { $gte: start, $lt: end } });
        }

        // c) Recherche par client (nomComplet) - filtré par business
        const clientIds = await Client.find({
          nomComplet: { $regex: regex },
          business: businessObjectId,
        }).distinct("_id");
        if (clientIds.length) {
          orClauses.push({ client: { $in: clientIds } });
        }

        // d) Recherche par vendeur (admin)
        if (role === "admin") {
          const vendorIds = await User.find({
            $or: [{ nom: { $regex: regex } }, { prenom: { $regex: regex } }],
          }).distinct("_id");
          if (vendorIds.length) {
            orClauses.push({ vendeur: { $in: vendorIds } });
          }
        }
      }

      // 3) Construction de la requête finale
      const filter = {
        business: businessObjectId, // ✅ Filtrer par boutique
      };

      if (orClauses.length) {
        filter.$or = orClauses;
      }

      // Filtre par status
      if (statuses.length) {
        filter.status = { $in: statuses };
      }

      // 4) ✅ IMPORTANT : Limitation au vendeur connecté si pas admin
      if (role !== "admin") {
        filter.vendeur = userId;
      }

      // 5) Pagination + récupération des données
      const skip = (page - 1) * limit;
      const [sales, total] = await Promise.all([
        Sale.find(filter, {
          reference: 1,
          dateExacte: 1,
          client: 1,
          vendeur: 1,
          total: 1,
          amountDue: 1,
          status: 1,
        })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("client", "nomComplet tel")
          .populate("vendeur", "nom prenom"),
        Sale.countDocuments(filter),
      ]);

      return NextResponse.json(
        {
          message: sales.length
            ? "Ventes récupérées avec succès."
            : "Aucune vente trouvée.",
          data: sales,
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          success: true,
          error: false,
        },
        { status: 200, headers: { "Cache-Control": "no-cache" } }
      );
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        {
          message: "Erreur! Veuillez réessayer.",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.SALES, // ✅ Flexible (overrides possibles)
    action: ACTIONS.LIST,
  }
);