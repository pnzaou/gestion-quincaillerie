import dbConnection from "@/lib/db";
import { withAuth } from "@/utils/withAuth"; // ✅ Déjà bon
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import Product from "@/models/Product.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary";
import authOptions from "@/lib/auth";
import History from "@/models/History.model";

// ============================================
// POST - Créer un produit
// ============================================
export const POST = withAuth(
  async (req, session) => { // ✅ session en paramètre
    await dbConnection();
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    try {
      // ✅ Plus besoin de getServerSession
      const { name, id: userId } = session.user;

      const {
        nom,
        prixAchat,
        prixVente,
        QteInitial,
        QteStock,
        QteAlerte,
        image,
        reference,
        description,
        dateExpiration,
        category_id,
        supplier_id,
        businessId,
      } = await req.json();

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

      if (
        !nom ||
        prixAchat === undefined ||
        prixVente === undefined ||
        QteInitial === undefined ||
        QteStock === undefined ||
        QteAlerte === undefined ||
        !category_id ||
        !supplier_id
      ) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Veuillez renseigner les champs obligatoires.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const businessObjectId = new mongoose.Types.ObjectId(businessId);

      const parsedAchat = Number(prixAchat);
      const parsedVente = Number(prixVente);
      const parsedQteInitial = Number(QteInitial);
      const parsedQteStock = QteStock !== undefined ? Number(QteStock) : parsedQteInitial;
      const parsedQteAlerte = Number(QteAlerte);

      const statut = parsedQteStock > 0 ? "En stock" : "En rupture";

      if (
        isNaN(parsedAchat) ||
        parsedAchat <= 0 ||
        isNaN(parsedVente) ||
        parsedVente <= 0
      ) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Les prix d'achat et de vente doivent être des nombres positifs.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      if (
        isNaN(parsedQteInitial) ||
        parsedQteInitial < 0 ||
        isNaN(parsedQteStock) ||
        parsedQteStock < 0 ||
        isNaN(parsedQteAlerte) ||
        parsedQteAlerte < 0
      ) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Les quantités doivent être des nombres entiers positifs ou nuls.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      if (category_id && !mongoose.Types.ObjectId.isValid(category_id)) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "L'ID de la catégorie est invalide.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      if (supplier_id && !mongoose.Types.ObjectId.isValid(supplier_id)) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "L'ID du fournisseur est invalide.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      if (dateExpiration && isNaN(Date.parse(dateExpiration))) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "La date d'expiration est invalide.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const existingProduct = await Product.findOne({
        nom,
        business: businessObjectId,
      }).session(mongoSession);

      if (existingProduct) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Ce produit existe déjà dans cette boutique.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const data = {
        nom,
        prixAchat: parsedAchat,
        prixVente: parsedVente,
        QteInitial: parsedQteInitial,
        QteStock: parsedQteStock,
        QteAlerte: parsedQteAlerte,
        reference,
        description,
        dateExpiration,
        category_id,
        supplier_id,
        statut,
        business: businessObjectId,
      };

      if (image && typeof image === "string" && image.startsWith("data:image/")) {
        try {
          const rep = await cloudinary.uploader.upload(image, {
            folder: "quincaillerie",
          });
          data.image = rep.secure_url;
        } catch (uploadErr) {
          console.warn(
            "Erreur lors de l'upload de l'image sur Cloudinary: ",
            uploadErr
          );
        }
      }

      const [rep] = await Product.create([data], { session: mongoSession });

      // Créer l'historique d'achat initial
      if (parsedQteInitial > 0 && parsedAchat > 0) {
        const PurchaseHistory = (await import("@/models/PurchaseHistory.model")).default;

        await PurchaseHistory.create(
          [
            {
              business: businessObjectId,
              product: rep._id,
              order: null,
              supplier: supplier_id ? new mongoose.Types.ObjectId(supplier_id) : null,
              quantity: parsedQteInitial,
              unitPrice: parsedAchat,
              totalCost: parsedQteInitial * parsedAchat,
              receivedDate: new Date(),
              receivedBy: userId,
              notes: "Stock initial",
            },
          ],
          { session: mongoSession }
        );
      }

      await History.create(
        [
          {
            user: userId,
            actions: "create",
            resource: "product",
            description: `${name} a créé le produit ${rep.nom}.`,
            resourceId: rep._id,
            business: businessObjectId,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      return NextResponse.json(
        {
          message: "Produit ajouté avec succès.",
          data: rep,
          success: true,
          error: false,
        },
        { status: 201 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur lors de l'ajout d'un produit: ", error);

      let errorMessage = "Erreur! Veuillez réessayer.";

      if (error.code === 11000) {
        errorMessage = "Ce produit existe déjà.";
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
    resource: RESOURCES.PRODUCTS, // ✅ Flexible
    action: ACTIONS.CREATE,
  }
);

// ============================================
// GET - Liste des produits
// ============================================
export const GET = withAuth(
  async (req, session) => { // ✅ session en paramètre
    try {
      await dbConnection();

      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const search = searchParams.get("search") || "";
      const categories = searchParams.get("categories") || "";
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

      const selectedCategories = categories
        ? categories.split(",").filter(Boolean).map((cat) => new mongoose.Types.ObjectId(cat))
        : [];

      const query = {
        business: businessObjectId,
        ...(search
          ? {
              $or: [
                { nom: { $regex: search, $options: "i" } },
                { reference: { $regex: search, $options: "i" } },
              ],
            }
          : {}),
        ...(selectedCategories.length > 0 ? { category_id: { $in: selectedCategories } } : {}),
      };

      const [articles, total] = await Promise.all([
        Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Product.countDocuments(query),
      ]);

      return NextResponse.json(
        {
          message:
            articles.length === 0
              ? "Aucun article enregistré."
              : "Articles récupérés avec succès.",
          data: articles,
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          success: true,
          error: false,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des articles: ", error);
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
    resource: RESOURCES.PRODUCTS, // ✅ Flexible
    action: ACTIONS.LIST,
  }
);