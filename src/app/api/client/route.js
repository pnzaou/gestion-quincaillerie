import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Client from "@/models/Client.model";
import History from "@/models/History.model";
import { withAuth } from "@/utils/withAuth"; // ✅ Déjà bon
import { RESOURCES, ACTIONS } from "@/lib/permissions"; // ✅ Nouveau
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// ============================================
// POST - Créer un client
// ============================================
export const POST = withAuth(
  async (req, session) => {
    await dbConnection();
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    try {
      const { name, id: userId } = session.user;

      const body = await req.json();
      
      // ✅ Extraction sécurisée avec gestion de null
      const nomComplet = body.nomComplet?.trim() || "";
      const tel = body.tel?.trim() || "";
      const email = body.email?.trim() || "";
      const adresse = body.adresse?.trim() || "";
      const businessId = body.businessId;

      // Validation businessId
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

      if (!nomComplet || !tel) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Le nom et le numéro de téléphone du client sont obligatoires.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const businessObjectId = new mongoose.Types.ObjectId(businessId);

      // Vérifier email unique par boutique (seulement si fourni)
      if (email) {
        const existingEmail = await Client.findOne({
          email: email,
          business: businessObjectId,
        }).session(mongoSession);

        if (existingEmail) {
          await mongoSession.abortTransaction();
          mongoSession.endSession();
          return NextResponse.json(
            {
              message: "Cet email est déjà utilisé dans cette boutique.",
              success: false,
              error: true,
            },
            { status: 400 }
          );
        }
      }

      // Vérifier téléphone unique par boutique
      const existingTel = await Client.findOne({
        tel: tel,
        business: businessObjectId,
      }).session(mongoSession);

      if (existingTel) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          {
            message: "Ce numéro de téléphone est déjà utilisé dans cette boutique.",
            success: false,
            error: true,
          },
          { status: 400 }
        );
      }

      const clientData = {
        nomComplet: nomComplet,
        tel: tel,
        adresse: adresse || "",
        business: businessObjectId,
      };

      // Ajouter email seulement s'il est fourni
      if (email) {
        clientData.email = email;
      }

      const [newClient] = await Client.create([clientData], { session: mongoSession });

      await History.create(
        [
          {
            user: userId,
            actions: "create",
            resource: "client",
            description: `${name} a créé le client ${newClient.nomComplet}.`,
            resourceId: newClient._id,
            business: businessObjectId,
          },
        ],
        { session: mongoSession }
      );

      await mongoSession.commitTransaction();
      mongoSession.endSession();

      return NextResponse.json(
        {
          message: "Client créé avec succès.",
          success: true,
          error: false,
          client: newClient,
        },
        { status: 201 }
      );
    } catch (error) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      console.error("Erreur lors de la création d'un client: ", error);

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
    resource: RESOURCES.CLIENTS,
    action: ACTIONS.CREATE,
  }
);

// ============================================
// GET - Liste des clients
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
        ...(search && { nomComplet: { $regex: search, $options: "i" } }),
      };

      const [clients, total] = await Promise.all([
        Client.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Client.countDocuments(query),
      ]);

      return NextResponse.json(
        {
          message:
            clients.length === 0
              ? "Aucun client enregistré."
              : "Clients récupérés avec succès.",
          data: clients,
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          success: true,
          error: false,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des clients: ", error);

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
    action: ACTIONS.LIST,
  }
);