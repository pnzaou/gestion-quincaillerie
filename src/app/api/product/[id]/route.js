import dbConnection from "@/lib/db";
import { withAuth } from "@/utils/withAuth"; // ✅ Déjà bon
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import Product from "@/models/Product.model";
import History from "@/models/History.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import authOptions from "@/lib/auth";

// ============================================
// GET - Détails d'un produit
// ============================================
export const GET = withAuth(
  async (req, context, session) => { // ✅ context + session
    try {
      await dbConnection();

      const { id } = await context.params; // ✅ Changé
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            message: "Veuillez fournir un ID valide",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const prod = await Product.findById(id).lean();
      if (!prod) {
        return NextResponse.json(
          {
            message: "Aucun produit trouvé pour cet ID",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      // Sérialiser les ObjectId
      const serializedProd = {
        ...prod,
        _id: prod._id.toString(),
        business: prod.business?.toString(),
        category_id: prod.category_id?.toString(),
        supplier_id: prod.supplier_id?.toString(),
      };

      return NextResponse.json(
        {
          message: "Produit récupéré avec succès.",
          data: serializedProd,
          success: true,
          error: false,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération du produit: ", error);
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
    action: ACTIONS.READ,
  }
);

// ============================================
// PUT - Modifier un produit
// ============================================
export const PUT = withAuth(
  async (req, context, session) => { // ✅ context + session
    await dbConnection();
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      // ✅ Plus besoin de getServerSession
      const { name, id: userId } = session.user;

      const { id } = await context.params; // ✅ Changé
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Veuillez fournir un ID valide",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const body = await req.json();
      if (Object.keys(body).length === 0) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Aucune donnée fournie pour la mise à jour.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

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
      } = body;

      if (category_id && !mongoose.Types.ObjectId.isValid(category_id)) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "ID de catégorie invalide.",
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
            message: "ID du fournisseur invalide.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const existingProduct = await Product.findById(id).session(mongoSession);
      if (!existingProduct) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Produit introuvable.",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      const updateData = {};

      if (typeof nom === "string") {
        const t = nom.trim();
        if (t) updateData.nom = t;
      }

      if (prixAchat !== undefined) {
        const v = Number(prixAchat);
        if (isNaN(v) || v <= 0) {
          await mongoSession.abortTransaction();
          mongoSession.endSession();
          return NextResponse.json(
            {
              message: "Le prix d'achat doit être un nombre positif.",
              success: false,
              error: true,
            },
            { status: 400 }
          );
        }
        updateData.prixAchat = v;
      }

      if (prixVente !== undefined) {
        const v = Number(prixVente);
        if (isNaN(v) || v <= 0) {
          await mongoSession.abortTransaction();
          mongoSession.endSession();
          return NextResponse.json(
            {
              message: "Le prix de vente doit être un nombre positif.",
              success: false,
              error: true,
            },
            { status: 400 }
          );
        }
        updateData.prixVente = v;
      }

      if (QteInitial !== undefined && QteInitial !== "") {
        const v = Number(QteInitial);
        if (isNaN(v) || v < 0) {
          await mongoSession.abortTransaction();
          mongoSession.endSession();
          return NextResponse.json(
            {
              message: "QteInitial doit être un entier ≥ 0.",
              success: false,
              error: true,
            },
            { status: 400 }
          );
        }
        updateData.QteInitial = v;
      }

      if (QteStock !== undefined && QteStock !== "") {
        const v = Number(QteStock);
        if (isNaN(v) || v < 0) {
          await mongoSession.abortTransaction();
          mongoSession.endSession();
          return NextResponse.json(
            {
              message: "QteStock doit être un entier ≥ 0.",
              success: false,
              error: true,
            },
            { status: 400 }
          );
        }
        updateData.QteStock = v;
      }

      if (QteAlerte !== undefined && QteAlerte !== "") {
        const v = Number(QteAlerte);
        if (isNaN(v) || v < 0) {
          await mongoSession.abortTransaction();
          mongoSession.endSession();
          return NextResponse.json(
            {
              message: "QteAlerte doit être un entier ≥ 0.",
              success: false,
              error: true,
            },
            { status: 400 }
          );
        }
        updateData.QteAlerte = v;
      }

      if (typeof reference === "string") {
        const t = reference.trim();
        if (t) updateData.reference = t;
      }

      if (typeof description === "string") {
        const t = description.trim();
        if (t) updateData.description = t;
      }

      if (dateExpiration !== undefined && dateExpiration !== "") {
        if (isNaN(Date.parse(dateExpiration))) {
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
        updateData.dateExpiration = dateExpiration;
      }

      if (category_id) updateData.category_id = category_id;
      if (supplier_id) updateData.supplier_id = supplier_id;

      if (image && typeof image === "string" && image.startsWith("data:image/")) {
        // suppression de l'ancienne
        if (existingProduct.image) {
          const parts = existingProduct.image.split("/");
          const name = parts[parts.length - 1].split(".")[0];
          const public_id = `quincaillerie/${name}`;
          try {
            await cloudinary.uploader.destroy(public_id);
          } catch (e) {
            console.error("Erreur suppression Cloudinary :", e);
          }
        }
        // upload de la nouvelle
        const uploadRes = await cloudinary.uploader.upload(image, { folder: "quincaillerie" });
        updateData.image = uploadRes.secure_url;
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
        session: mongoSession,
      });

      await History.create(
        [
          {
            user: userId,
            actions: "update",
            resource: "product",
            resourceId: id,
            description: `${name} a modifié le produit ${updatedProduct.nom}`,
            business: updatedProduct.business,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      return NextResponse.json(
        {
          message: "Produit mis à jour avec succès.",
          data: updatedProduct,
          success: true,
          error: false,
        },
        { status: 200 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur mise à jour produit:", error);
      return NextResponse.json(
        {
          message: "Erreur serveur. Veuillez réessayer.",
          success: false,
          error: true,
        },
        { status: 500 }
      );
    }
  },
  {
    resource: RESOURCES.PRODUCTS, // ✅ Flexible
    action: ACTIONS.UPDATE,
  }
);

// ============================================
// DELETE - Supprimer un produit
// ============================================
export const DELETE = withAuth(
  async (req, context, session) => { // ✅ context + session
    await dbConnection();
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      // ✅ Plus besoin de getServerSession
      const { name, id: userId } = session.user;

      const { id } = await context.params; // ✅ Changé
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Veuillez fournir un ID valide",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const deletedProduct = await Product.findByIdAndDelete(id, { session: mongoSession });

      if (!deletedProduct) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Aucun produit trouvé pour cet ID.",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      await History.create(
        [
          {
            user: userId,
            actions: "delete",
            resource: "product",
            resourceId: id,
            description: `${name} a supprimé le produit ${deletedProduct.nom}`,
            business: deletedProduct.business,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      return NextResponse.json(
        {
          message: "Produit supprimé avec succès.",
          success: true,
          error: false,
        },
        { status: 200 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur lors de la suppression de l'article: ", error);
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
    action: ACTIONS.DELETE,
  }
);