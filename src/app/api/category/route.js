import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuth"; // ✅ Changé
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import dbConnection from "@/lib/db";
import Category from "@/models/Category.model";
import History from "@/models/History.model";

// ============================================
// POST - Créer une catégorie
// ============================================
export const POST = withAuth(
  async (req, session) => { // ✅ session en paramètre
    await dbConnection();
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      // ✅ Plus besoin de getServerSession
      const { name, id } = session.user;

      const { nom, description, businessId } = await req.json();

      if (!businessId) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "ID de la boutique manquant.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      if (!nom || !nom.trim()) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Veuillez renseigner le nom de la catégorie.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const businessObjectId = new mongoose.Types.ObjectId(businessId);

      // Vérifier si la catégorie existe déjà DANS CETTE BOUTIQUE
      const existingCategory = await Category.findOne({
        nom,
        business: businessObjectId,
      }).session(mongoSession);

      if (existingCategory) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Cette catégorie existe déjà dans cette boutique.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const [rep] = await Category.create(
        [{ nom, description, business: businessObjectId }],
        { session: mongoSession }
      );

      await History.create(
        [
          {
            user: id,
            actions: "create",
            resource: "category",
            resourceId: rep._id,
            description: `${name} a créé la catégorie ${rep.nom}`,
            business: businessObjectId,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      return NextResponse.json(
        {
          message: "Catégorie ajoutée avec succès.",
          data: rep,
          success: true,
          error: false,
        },
        { status: 201 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur lors de la création d'une catégorie: ", error);

      let errorMessage = "Erreur! Veuillez réessayer.";

      if (error.code === 11000) {
        errorMessage = "Cette catégorie existe déjà.";
      }

      return NextResponse.json(
        {
          message: errorMessage,
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.CATEGORIES, // ✅ Flexible
    action: ACTIONS.CREATE,
  }
);

// ============================================
// GET - Liste des catégories
// ============================================
export const GET = withAuth(
  async (req, session) => { // ✅ session en paramètre
    try {
      await dbConnection();

      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "0");
      const search = searchParams.get("search") || "";
      const businessId = searchParams.get("businessId");
      const skip = (page - 1) * limit;

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

      const query = {
        business: businessObjectId,
        ...(search && { nom: { $regex: search, $options: "i" } }),
      };

      const [categories, total] = await Promise.all([
        Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Category.countDocuments(query),
      ]);

      return NextResponse.json(
        {
          message:
            categories.length === 0
              ? "Aucune catégorie enregistrée."
              : "Catégories récupérées avec succès.",
          data: categories,
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          success: true,
          error: false,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories: ", error);
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
    resource: RESOURCES.CATEGORIES, // ✅ Flexible
    action: ACTIONS.LIST,
  }
);