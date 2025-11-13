import authOptions from "@/lib/auth";
import dbConnection from "@/lib/db";
import Payment from "@/models/Payment.model";
import Sale from "@/models/Sale.model";
import { debit, getBalance } from "@/services/account.service";
import { HttpError } from "@/services/errors.service";
import { createHistory } from "@/services/history.service";
import { withAuth } from "@/utils/withAuth";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req, { params }) => {
  try {
    await dbConnection();

    const { id } = await params;
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

    // Récupérer la vente en population client, vendeur et product dans items
    const sale = await Sale.findById(id)
      .populate({ path: "client", model: "Client" })
      .populate("vendeur", "nom prenom")
      .populate({ path: "items.product", model: "Product" })
      .lean();

    if (!sale) {
      return NextResponse.json(
        {
          message: "Aucune vente trouvée avec cet ID",
          success: false,
          error: true,
        },
        { status: 404 }
      );
    }

    // Récupérer les paiements liés à cette vente
    const payments = await Payment.find({ sale: id })
      .sort({ createdAt: 1 })
      .lean();

    // Optionnel : garantir que chaque item a bien un objet product (si produit supprimé côté catalogue)
    sale.items = sale.items.map((it) => {
      if (!it.product) {
        // si product supprimé, garder l'info minimale déjà présente dans l'item (si tu en as stocké une copie)
        return it;
      }
      return it;
    });

    return NextResponse.json(
      {
        success: true,
        sale,
        payments,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erreur serveur lors de la récupération de la vente",
        success: false,
        error: true,
        details: error.message,
      },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req, { params }) => {
  await dbConnection();
  const session = await getServerSession(authOptions);
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { id } = await params;
    
    // Validation de l'ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "ID de vente invalide", success: false, error: true },
        { status: 400 }
      );
    }

    // Récupérer les données du body
    const body = await req.json();
    const { amount, method } = body;

    // Validations
    if (!amount || !Number.isFinite(amount) || amount <= 0) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json(
        { message: "Montant invalide", success: false, error: true },
        { status: 400 }
      );
    }

    if (!method) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json(
        { message: "Mode de paiement requis", success: false, error: true },
        { status: 400 }
      );
    }

    // Récupérer la vente
    const sale = await Sale.findById(id)
      .populate("client")
      .session(mongoSession);

    if (!sale) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json(
        { message: "Vente introuvable", success: false, error: true },
        { status: 404 }
      );
    }

    // Vérifier que la vente n'est pas déjà payée ou annulée
    if (sale.status === "paid") {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json(
        { message: "Cette vente est déjà entièrement payée", success: false, error: true },
        { status: 400 }
      );
    }

    if (sale.status === "cancelled") {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json(
        { message: "Impossible de payer une vente annulée", success: false, error: true },
        { status: 400 }
      );
    }

    // Vérifier que le montant ne dépasse pas ce qui reste à payer
    const currentAmountDue = sale.amountDue || sale.total;
    if (amount > currentAmountDue) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json(
        { 
          message: `Le montant ne peut pas dépasser le montant dû (${currentAmountDue} FCFA)`, 
          success: false, 
          error: true 
        },
        { status: 400 }
      );
    }

    // Si paiement par compte client
    if (method === "account") {
      if (!sale.client) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          { message: "Client requis pour paiement depuis le compte", success: false, error: true },
          { status: 400 }
        );
      }

      // Vérifier le solde
      const balance = await getBalance(sale.client._id, mongoSession);
      if (balance < amount) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json(
          { 
            message: `Solde compte client insuffisant. Solde actuel: ${balance} FCFA`, 
            success: false, 
            error: true 
          },
          { status: 400 }
        );
      }

      // Débiter le compte
      await debit(sale.client._id, amount, {
        session: mongoSession,
        reference: sale.reference,
        description: `Paiement vente ${sale.reference}`,
        relatedSaleId: sale._id,
        createdBy: session?.user?.id
      });
    }

    // Créer le paiement
    const [payment] = await Payment.create([{
      sale: sale._id,
      amount,
      method
    }], { session: mongoSession });

    // Récupérer tous les paiements pour recalculer
    const allPayments = await Payment.find({ sale: sale._id })
      .session(mongoSession);
    
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const newAmountDue = Math.max(0, sale.total - totalPaid);

    // Déterminer le nouveau statut
    let newStatus = sale.status;
    if (newAmountDue === 0) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "partial";
    }

    // Mettre à jour la vente
    sale.amountDue = newAmountDue;
    sale.status = newStatus;
    await sale.save({ session: mongoSession });

    // Créer l'historique
    const description = `Paiement de ${amount} FCFA (${method}) pour la vente ${sale.reference}. Nouveau statut: ${newStatus}. Reste à payer: ${newAmountDue} FCFA`;
    
    await createHistory({
      userId: session?.user?.id,
      action: "update",
      resource: "sale",
      resourceId: sale._id,
      description
    }, mongoSession);

    // Commit
    await mongoSession.commitTransaction();
    mongoSession.endSession();

    return NextResponse.json({
      message: "Paiement enregistré avec succès",
      success: true,
      error: false,
      data: {
        payment,
        sale: {
          status: newStatus,
          amountDue: newAmountDue,
          totalPaid
        }
      }
    }, { status: 201 });

  } catch (err) {
    await mongoSession.abortTransaction();
    mongoSession.endSession();
    
    console.error("Erreur lors du paiement:", err);
    
    if (err instanceof HttpError || (err.status && err.message)) {
      return NextResponse.json(
        { message: err.message, success: false, error: true },
        { status: err.status || 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Erreur lors de l'enregistrement du paiement", success: false, error: true },
      { status: 500 }
    );
  }
});