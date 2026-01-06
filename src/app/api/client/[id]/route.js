import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Client from "@/models/Client.model";
import ClientAccountModel from "@/models/ClientAccount.model";
import AccountTransactionModel from "@/models/AccountTransaction.model";
import Sale from "@/models/Sale.model";
import History from "@/models/History.model";
import { getAccountByClientId } from "@/services/account.service";
import { withAuth } from "@/utils/withAuth"; // ✅ Déjà bon
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// ============================================
// GET - Détails client + compte
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

      const client = await Client.findById(id);
      if (!client) {
        return NextResponse.json(
          {
            message: "Aucun client trouvé pour cet ID",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      const account = await getAccountByClientId(id);

      return NextResponse.json(
        {
          message: "Client récupéré avec succès",
          success: true,
          error: false,
          data: {
            client,
            account,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des infos du client: ", error);
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
    resource: RESOURCES.CLIENTS, // ✅ Flexible
    action: ACTIONS.READ,
  }
);

// ============================================
// DELETE - Supprimer client (avec vérifications)
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

      // Récupérer le client
      const client = await Client.findById(id).session(mongoSession);
      if (!client) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Client introuvable",
            success: false,
            error: true,
          },
          { status: 404 }
        );
      }

      // Vérifier s'il y a des ventes liées à ce client dans cette boutique
      const salesCount = await Sale.countDocuments({
        client: id,
        business: client.business,
      }).session(mongoSession);

      if (salesCount > 0) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: `Impossible de supprimer ce client. Il a ${salesCount} vente(s) associée(s).`,
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      // Supprimer le compte client s'il existe
      const account = await ClientAccountModel.findOne({
        client: id,
        business: client.business,
      }).session(mongoSession);

      if (account) {
        // Vérifier si le compte a un solde
        if (account.balance !== 0) {
          await mongoSession.abortTransaction();
          mongoSession.endSession();
          return NextResponse.json(
            {
              message: `Impossible de supprimer ce client. Le compte a un solde de ${account.balance} FCFA.`,
              success: false,
              error: true,
            },
            { status: 400 }
          );
        }

        // Supprimer les transactions du compte
        await AccountTransactionModel.deleteMany({
          account: account._id,
          business: client.business,
        }).session(mongoSession);

        // Supprimer le compte
        await ClientAccountModel.deleteOne({
          _id: account._id,
        }).session(mongoSession);
      }

      // Supprimer le client
      await Client.deleteOne({ _id: id }).session(mongoSession);

      // Créer l'historique avec businessId
      await History.create(
        [
          {
            user: userId,
            actions: "delete",
            resource: "client",
            description: `${name} a supprimé le client ${client.nomComplet}.`,
            resourceId: id,
            business: client.business,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      return NextResponse.json(
        {
          message: "Client supprimé avec succès.",
          success: true,
          error: false,
        },
        { status: 200 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur lors de la suppression du client:", error);

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
    resource: RESOURCES.CLIENTS, // ✅ Flexible
    action: ACTIONS.DELETE,
  }
);