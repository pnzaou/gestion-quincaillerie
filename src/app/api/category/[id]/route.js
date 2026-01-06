import dbConnection from "@/lib/db";
import Category from "@/models/Category.model";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Product from "@/models/Product.model";
import { withAuth } from "@/utils/withAuth"; // ✅ Changé
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import History from "@/models/History.model";

// ============================================
// GET - Détails d'une catégorie
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

      const cat = await Category.findById(id);
      if (!cat) {
        return NextResponse.json(
          {
            message: "Aucune catégorie trouvée pour cet ID",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "Catégorie récupérée avec succès.",
          data: cat,
          success: true,
          error: false,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération de la catégorie: ", error);
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
    action: ACTIONS.READ,
  }
);

// ============================================
// PUT - Modifier une catégorie
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

      const { nom, description } = await req.json();

      if (!nom.trim() && !description.trim()) {
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

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { nom, description },
        { new: true, runValidators: true, session: mongoSession }
      );

      if (!updatedCategory) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Aucune catégorie trouvée pour cet ID.",
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
            actions: "update",
            resource: "category",
            resourceId: id,
            description: `${name} a modifié la catégorie ${updatedCategory.nom}`,
            business: updatedCategory.business,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      return NextResponse.json(
        {
          message: "Catégorie mise à jour avec succès.",
          data: updatedCategory,
          success: true,
        },
        { status: 200 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur lors de la modification de la catégorie: ", error);
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
    action: ACTIONS.UPDATE,
  }
);

// ============================================
// DELETE - Supprimer une catégorie
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
            message: "Veuillez fournir un ID valide.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const deletedCategory = await Category.findByIdAndDelete(id, {
        session: mongoSession,
      });

      if (!deletedCategory) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Aucune catégorie trouvée pour cet ID.",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      // Supprimer les produits liés à cette catégorie DANS LA MÊME BOUTIQUE
      await Product.deleteMany(
        {
          category_id: id,
          business: deletedCategory.business,
        },
        { session: mongoSession }
      );

      await History.create(
        [
          {
            user: userId,
            actions: "delete",
            resource: "category",
            resourceId: id,
            description: `${name} a supprimé la catégorie ${deletedCategory.nom}`,
            business: deletedCategory.business,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      return NextResponse.json(
        {
          message: "Catégorie supprimée avec succès.",
          success: true,
          error: false,
        },
        { status: 200 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur lors de la suppression de la catégorie: ", error);
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
    action: ACTIONS.DELETE,
  }
);