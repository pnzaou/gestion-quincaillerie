import dbConnection from "@/lib/db";
import Supplier from "@/models/Supplier.model";
import History from "@/models/History.model";
import { withAuth } from "@/utils/withAuth"; // ✅ Changé
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// ============================================
// PUT - Modifier un fournisseur
// ============================================
export const PUT = withAuth(
  async (req, context, session) => { // ✅ context + session
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      await dbConnection();

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

      const { nom, adresse, telephone, email } = await req.json();
      if (!nom.trim() || !telephone.trim()) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Veuillez renseigner le nom et le numéro de téléphone du fournisseur.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const updatedSupplier = await Supplier.findByIdAndUpdate(
        id,
        {
          nom: nom.trim(),
          adresse: adresse.trim(),
          telephone: telephone.trim(),
          email: email.trim(),
        },
        { new: true, runValidators: true, session: mongoSession }
      );

      if (!updatedSupplier) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Aucun fournisseur trouvé pour cet ID.",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      // Création de l'historique
      await History.create(
        [
          {
            user: userId,
            actions: "update",
            resource: "supplier",
            resourceId: id,
            description: `${name} a modifié le fournisseur ${updatedSupplier.nom}`,
            business: updatedSupplier.business,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      return NextResponse.json(
        {
          message: "Fournisseur mis à jour avec succès.",
          data: updatedSupplier,
          success: true,
          error: false,
        },
        { status: 200 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur lors de la modification d'un fournisseur: ", error);

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
    resource: RESOURCES.SUPPLIERS, // ✅ Flexible
    action: ACTIONS.UPDATE,
  }
);

// ============================================
// DELETE - Supprimer un fournisseur
// ============================================
export const DELETE = withAuth(
  async (req, context, session) => { // ✅ context + session
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      await dbConnection();

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

      const deletedSupplier = await Supplier.findByIdAndDelete(id, {
        session: mongoSession,
      });

      if (!deletedSupplier) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Aucun fournisseur trouvé pour cet ID.",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      // Création de l'historique
      await History.create(
        [
          {
            user: userId,
            actions: "delete",
            resource: "supplier",
            resourceId: id,
            description: `${name} a supprimé le fournisseur ${deletedSupplier.nom}`,
            business: deletedSupplier.business,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      return NextResponse.json(
        {
          message: "Fournisseur supprimé avec succès",
          success: true,
          error: false,
        },
        { status: 200 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur lors de la suppression du fournisseur: ", error);
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
    resource: RESOURCES.SUPPLIERS, // ✅ Flexible
    action: ACTIONS.DELETE,
  }
);