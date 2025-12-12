import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Client from "@/models/Client.model";
import History from "@/models/History.model";
import { deposit } from "@/services/account.service";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// POST - Créer un compte client avec dépôt initial
export const POST = withAuth(async (req, { params }) => {
  await dbConnection();
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const session = await getServerSession(authOptions);
    const { name, id: userId } = session.user;

    const { id: clientId } = await params;
    const body = await req.json();
    const { amount, description } = body;

    // Validation
    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({
        message: "ID client invalide",
        success: false,
        error: true
      }, { status: 400 });
    }

    if (!amount || !Number.isFinite(amount) || amount <= 0) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({
        message: "Montant invalide",
        success: false,
        error: true
      }, { status: 400 });
    }

    // Récupérer le client
    const client = await Client.findById(clientId).session(mongoSession);
    if (!client) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({
        message: "Client introuvable",
        success: false,
        error: true
      }, { status: 404 });
    }

    // ✅ Créer le compte avec dépôt initial (avec businessId)
    const { account, transaction } = await deposit(clientId, amount, {
      session: mongoSession,
      description: description || "Dépôt initial",
      createdBy: userId,
      businessId: client.business, // ✅ Passer le businessId du client
      reference: `DEPOT-${Date.now()}`
    });

    // ✅ Créer l'historique avec businessId
    await History.create([{
      user: userId,
      actions: "create",
      resource: "client-account",
      description: `${name} a créé un compte pour ${client.nomComplet} avec un dépôt de ${amount} FCFA.`,
      resourceId: account._id,
      business: client.business // ✅ Ajout du business
    }], { session: mongoSession });

    await mongoSession.commitTransaction();
    mongoSession.endSession();

    return NextResponse.json({
      message: "Compte créé avec succès",
      success: true,
      error: false,
      data: {
        account,
        transaction
      }
    }, { status: 201 });

  } catch (error) {
    await mongoSession.abortTransaction();
    mongoSession.endSession();
    console.error("Erreur lors de la création du compte client:", error);

    return NextResponse.json({
      message: error.message || "Erreur! Veuillez réessayer.",
      success: false,
      error: true
    }, { status: 500 });
  }
});

// PUT - Ajouter un dépôt à un compte existant
export const PUT = withAuth(async (req, { params }) => {
  await dbConnection();
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const session = await getServerSession(authOptions);
    const { name, id: userId } = session.user;

    const { id: clientId } = await params;
    const body = await req.json();
    const { amount, description } = body;

    // Validation
    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({
        message: "ID client invalide",
        success: false,
        error: true
      }, { status: 400 });
    }

    if (!amount || !Number.isFinite(amount) || amount <= 0) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({
        message: "Montant invalide",
        success: false,
        error: true
      }, { status: 400 });
    }

    // Récupérer le client
    const client = await Client.findById(clientId).session(mongoSession);
    if (!client) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({
        message: "Client introuvable",
        success: false,
        error: true
      }, { status: 404 });
    }

    // ✅ Effectuer le dépôt (avec businessId)
    const { account, transaction } = await deposit(clientId, amount, {
      session: mongoSession,
      description: description || "Dépôt",
      createdBy: userId,
      businessId: client.business, // ✅ Passer le businessId du client
      reference: `DEPOT-${Date.now()}`
    });

    // ✅ Créer l'historique avec businessId
    await History.create([{
      user: userId,
      actions: "update",
      resource: "client-account",
      description: `${name} a effectué un dépôt de ${amount} FCFA pour ${client.nomComplet}. Nouveau solde: ${account.balance} FCFA.`,
      resourceId: account._id,
      business: client.business // ✅ Ajout du business
    }], { session: mongoSession });

    await mongoSession.commitTransaction();
    mongoSession.endSession();

    return NextResponse.json({
      message: "Dépôt effectué avec succès",
      success: true,
      error: false,
      data: {
        account,
        transaction
      }
    }, { status: 200 });

  } catch (error) {
    await mongoSession.abortTransaction();
    mongoSession.endSession();
    console.error("Erreur lors du dépôt:", error);

    return NextResponse.json({
      message: error.message || "Erreur! Veuillez réessayer.",
      success: false,
      error: true
    }, { status: 500 });
  }
});