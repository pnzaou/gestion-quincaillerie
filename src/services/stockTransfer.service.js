import mongoose from "mongoose";
import StockTransfer from "@/models/StockTransfer.model";
import Product from "@/models/Product.model";
import Order from "@/models/Order.model";
import PurchaseHistory from "@/models/PurchaseHistory.model";
import { HttpError } from "./errors.service";
import { createHistory } from "./history.service";
import { generateOrderReference } from "./generateOrderReference.service";

/**
 * Génère une référence unique pour un transfert
 */
async function generateTransferReference(date, session = null) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `TRANS-${year}${month}${day}`;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await StockTransfer.countDocuments({
    transferDate: { $gte: startOfDay, $lte: endOfDay }
  }).session(session);

  const sequence = String(count + 1).padStart(3, '0');
  return `${datePrefix}-${sequence}`;
}

/**
 * Trouve le produit correspondant dans une boutique destination
 * Priorité : globalReference > reference > nom
 */
async function findMatchingProduct(sourceProduct, destinationBusinessId, session = null) {
  const destBusinessId = new mongoose.Types.ObjectId(destinationBusinessId);
  
  let destProduct = null;
  
  // 1️⃣ PRIORITÉ 1 : Matching par globalReference (le plus fiable)
  if (sourceProduct.globalReference) {
    destProduct = await Product.findOne({
      globalReference: sourceProduct.globalReference,
      business: destBusinessId
    }).session(session);
    
    if (destProduct) {
      return { product: destProduct, matchMethod: 'globalReference' };
    }
  }
  
  // 2️⃣ PRIORITÉ 2 : Matching par reference locale
  if (sourceProduct.reference) {
    destProduct = await Product.findOne({
      reference: sourceProduct.reference,
      business: destBusinessId
    }).session(session);
    
    if (destProduct) {
      return { product: destProduct, matchMethod: 'reference' };
    }
  }
  
  // 3️⃣ PRIORITÉ 3 : Matching par nom
  destProduct = await Product.findOne({
    nom: sourceProduct.nom,
    business: destBusinessId
  }).session(session);
  
  if (destProduct) {
    return { product: destProduct, matchMethod: 'name' };
  }
  
  // ❌ Aucun matching trouvé
  return { product: null, matchMethod: null };
}

/**
 * Crée un produit dans la boutique destination
 */
async function createProductInDestination(sourceProduct, destinationBusinessId, transferPrice, session = null) {
  const destBusinessId = new mongoose.Types.ObjectId(destinationBusinessId);
  
  const [newProduct] = await Product.create([{
    business: destBusinessId,
    globalReference: sourceProduct.globalReference || null,
    nom: sourceProduct.nom,
    prixAchat: Math.round(transferPrice * 100) / 100,
    prixVente: sourceProduct.prixVente,
    QteInitial: 0,
    QteStock: 0,
    QteAlerte: sourceProduct.QteAlerte,
    image: sourceProduct.image,
    reference: sourceProduct.reference,
    description: sourceProduct.description,
    category_id: sourceProduct.category_id,
    supplier_id: sourceProduct.supplier_id,
    statut: "En rupture"
  }], { session });

  return newProduct;
}

/**
 * Crée un transfert de stock entre deux boutiques
 */
export async function createStockTransfer({
  sourceBusiness,
  destinationBusiness,
  items,
  sourceOrder = null,
  reason = 'other',
  expectedArrival = null,
  notes = null,
  user
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ Validations
    if (!sourceBusiness || !destinationBusiness) {
      throw new HttpError(400, "Boutiques source et destination requises");
    }

    if (sourceBusiness === destinationBusiness) {
      throw new HttpError(400, "Les boutiques source et destination doivent être différentes");
    }

    if (!items || items.length === 0) {
      throw new HttpError(400, "Au moins un article requis");
    }

    const sourceBusinessId = new mongoose.Types.ObjectId(sourceBusiness);
    const destBusinessId = new mongoose.Types.ObjectId(destinationBusiness);

    // ✅ Préparer les items du transfert
    const transferItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const { productId, quantity, transferPrice, notes: itemNotes } = item;

      // Arrondir à 2 décimales
      const roundedQty = Math.round(quantity * 100) / 100;
      const roundedPrice = Math.round(transferPrice * 100) / 100;

      if (roundedQty <= 0) {
        throw new HttpError(400, `Quantité invalide pour le produit ${productId}`);
      }

      // Vérifier produit source
      const sourceProduct = await Product.findOne({
        _id: productId,
        business: sourceBusinessId
      }).session(session);

      if (!sourceProduct) {
        throw new HttpError(404, `Produit ${productId} introuvable dans la boutique source`);
      }

      // Vérifier stock disponible
      if (sourceProduct.QteStock < roundedQty) {
        throw new HttpError(400, 
          `Stock insuffisant pour ${sourceProduct.nom}. Disponible: ${sourceProduct.QteStock}, Demandé: ${roundedQty}`
        );
      }

      // ✅ Trouver ou créer le produit correspondant dans la destination
      const { product: destProduct, matchMethod } = await findMatchingProduct(
        sourceProduct, 
        destBusinessId, 
        session
      );
      
      let finalDestProduct;
      
      if (destProduct) {
        console.log(`✅ Produit "${sourceProduct.nom}" trouvé dans destination via ${matchMethod}`);
        finalDestProduct = destProduct;
      } else {
        console.log(`⚠️ Produit "${sourceProduct.nom}" non trouvé - création automatique`);
        finalDestProduct = await createProductInDestination(
          sourceProduct, 
          destBusinessId, 
          roundedPrice, 
          session
        );
      }

      // Ajouter l'item au transfert
      transferItems.push({
        product: sourceProduct._id,
        sourceProductId: sourceProduct._id,
        destinationProductId: finalDestProduct._id,
        quantity: roundedQty,
        transferPrice: roundedPrice,
        originalPurchasePrice: sourceProduct.prixAchat,
        notes: itemNotes
      });

      totalAmount += roundedQty * roundedPrice;

      // ✅ Déduire du stock source IMMÉDIATEMENT
      sourceProduct.QteStock = Math.round((sourceProduct.QteStock - roundedQty) * 100) / 100;
      sourceProduct.QteInitial = Math.round((sourceProduct.QteInitial - roundedQty) * 100) / 100; // ✅ AJOUTER CETTE LIGNE

      if (sourceProduct.QteStock <= 0) {
        sourceProduct.statut = "En rupture";
      }
      await sourceProduct.save({ session });
    }

    // ✅ Générer référence
    const reference = await generateTransferReference(new Date(), session);

    // ✅ Créer le transfert
    const transferData = {
      reference,
      sourceBusiness: sourceBusinessId,
      destinationBusiness: destBusinessId,
      sourceOrder: sourceOrder ? new mongoose.Types.ObjectId(sourceOrder) : null,
      items: transferItems,
      status: 'pending',
      transferDate: new Date(),
      expectedArrival,
      totalAmount: Math.round(totalAmount * 100) / 100,
      createdBy: user?.id,
      notes,
      metadata: {
        reason,
        additionalInfo: {}
      }
    };

    const [transfer] = await StockTransfer.create([transferData], { session });

    // ✅ Créer l'historique dans la boutique SOURCE
    await createHistory({
      userId: user?.id,
      action: "create",
      resource: "transfer",
      resourceId: transfer._id,
      description: `Transfert ${reference} créé vers une autre boutique. ${items.length} produit(s), montant total: ${transfer.totalAmount.toFixed(2)} FCFA`,
      businessId: sourceBusinessId
    }, session);

    // ✅ Créer une commande automatique dans la boutique destination
    const orderReference = await generateOrderReference(new Date(), destBusinessId, session);
    
    const orderItems = transferItems.map(item => ({
      product: item.destinationProductId,
      quantity: item.quantity,
      estimatedPrice: item.transferPrice,
      actualPrice: item.transferPrice, // Prix déjà connu
      receivedQuantity: 0,
      status: 'pending'
    }));

    const [destinationOrder] = await Order.create([{
      business: destBusinessId,
      reference: orderReference,
      supplier: null, // Pas de fournisseur pour un transfert interne
      items: orderItems,
      status: 'confirmed', // Directement confirmé car transfert interne
      orderDate: new Date(),
      expectedDelivery: expectedArrival,
      estimatedTotal: Math.round(totalAmount * 100) / 100,
      actualTotal: Math.round(totalAmount * 100) / 100,
      priceVariance: 0,
      createdBy: user?.id,
      notes: `Transfert inter-boutiques - Réf: ${reference}`
    }], { session });

    // ✅ Créer l'historique dans la boutique DESTINATION
    await createHistory({
      userId: user?.id,
      action: "create",
      resource: "order",
      resourceId: destinationOrder._id,
      description: `Commande ${orderReference} créée automatiquement suite au transfert ${reference}. ${items.length} produit(s), montant: ${totalAmount.toFixed(2)} FCFA`,
      businessId: destBusinessId
    }, session);

    // ✅ Lier la commande au transfert
    transfer.destinationOrder = destinationOrder._id;
    await transfer.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      transfer,
      destinationOrder
    };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    
    if (err instanceof HttpError) throw err;
    console.error("createStockTransfer unexpected error:", err);
    throw new HttpError(500, "Erreur lors de la création du transfert");
  }
}

/**
 * Valide un transfert (boutique source confirme l'envoi)
 */
export async function validateTransfer(transferId, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transfer = await StockTransfer.findById(transferId).session(session);
    
    if (!transfer) {
      throw new HttpError(404, "Transfert introuvable");
    }

    if (transfer.status !== 'pending') {
      throw new HttpError(400, "Ce transfert ne peut plus être validé");
    }

    transfer.status = 'validated';
    transfer.validatedBy = userId;
    await transfer.save({ session });

    // Historique boutique source
    await createHistory({
      userId,
      action: "update",
      resource: "transfer",
      resourceId: transfer._id,
      description: `Transfert ${transfer.reference} validé et envoyé`,
      businessId: transfer.sourceBusiness
    }, session);

    await session.commitTransaction();
    session.endSession();

    return transfer;

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

/**
 * Réceptionne un transfert dans la boutique destination
 * Cette fonction est appelée automatiquement quand la commande destination est reçue
 */
export async function receiveTransferFromOrder(orderId, userId, session) {
  try {
    // Trouver le transfert lié à cette commande
    const transfer = await StockTransfer.findOne({
      destinationOrder: orderId
    })
    .populate('items.destinationProductId') // ✅ Pour avoir les infos produit
    .session(session);

    if (!transfer) {
      // Pas de transfert lié, c'est une commande normale
      return null;
    }

    if (transfer.status === 'received') {
      // Déjà reçu
      return transfer;
    }

    // ✅ NOUVEAU : Créer les PurchaseHistory pour chaque item du transfert
    // Note: On le fait ICI et pas dans receiveOrder() car on a besoin de la référence au transfert
    for (const item of transfer.items) {
      await PurchaseHistory.create([{
        business: transfer.destinationBusiness,
        product: item.destinationProductId._id || item.destinationProductId,
        source: 'transfer', // ✅ Indique que c'est un transfert
        order: null, // Pas de fournisseur
        transfer: transfer._id, // ✅ Référence au transfert
        supplier: null, // Pas de fournisseur pour un transfert
        quantity: item.quantity,
        unitPrice: item.transferPrice,
        totalCost: Math.round((item.quantity * item.transferPrice) * 100) / 100,
        receivedDate: new Date(),
        receivedBy: userId,
        notes: `Transfert depuis boutique source - Réf: ${transfer.reference}`
      }], { session });
    }

    // Marquer le transfert comme reçu
    transfer.status = 'received';
    transfer.receivedDate = new Date();
    transfer.receivedBy = userId;
    await transfer.save({ session });

    // Historique boutique destination
    await createHistory({
      userId,
      action: "update",
      resource: "transfer",
      resourceId: transfer._id,
      description: `Transfert ${transfer.reference} réceptionné avec succès`,
      businessId: transfer.destinationBusiness
    }, session);

    return transfer;

  } catch (err) {
    console.error("receiveTransferFromOrder error:", err);
    throw err;
  }
}

/**
 * Annule un transfert et remet le stock dans la boutique source
 */
export async function cancelTransfer(transferId, userId, reason = null) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transfer = await StockTransfer.findById(transferId).session(session);
    
    if (!transfer) {
      throw new HttpError(404, "Transfert introuvable");
    }

    if (transfer.status === 'received') {
      throw new HttpError(400, "Impossible d'annuler un transfert déjà reçu");
    }

    if (transfer.status === 'cancelled') {
      throw new HttpError(400, "Ce transfert est déjà annulé");
    }

    // ✅ Remettre le stock dans la boutique source
    for (const item of transfer.items) {
      const sourceProduct = await Product.findById(item.sourceProductId).session(session);
      
      if (sourceProduct) {
        sourceProduct.QteStock = Math.round((sourceProduct.QteStock + item.quantity) * 100) / 100;
        sourceProduct.QteInitial = Math.round((sourceProduct.QteInitial + item.quantity) * 100) / 100; // ✅ AJOUTER

        if (sourceProduct.QteStock > 0) {
          sourceProduct.statut = "En stock";
        }

        await sourceProduct.save({ session });
      }
    }

    // ✅ Annuler le transfert
    transfer.status = 'cancelled';
    transfer.notes = `${transfer.notes || ''}\nAnnulé le ${new Date().toISOString()}${reason ? `: ${reason}` : ''}`;
    await transfer.save({ session });

    // Historique source
    await createHistory({
      userId,
      action: "delete",
      resource: "transfer",
      resourceId: transfer._id,
      description: `Transfert ${transfer.reference} annulé${reason ? `: ${reason}` : ''}`,
      businessId: transfer.sourceBusiness
    }, session);

    // ✅ Annuler la commande destination
    if (transfer.destinationOrder) {
      const order = await Order.findById(transfer.destinationOrder).session(session);
      if (order && order.status !== 'completed') {
        order.status = 'cancelled';
        await order.save({ session });

        // Historique destination
        await createHistory({
          userId,
          action: "delete",
          resource: "order",
          resourceId: order._id,
          description: `Commande ${order.reference} annulée suite à l'annulation du transfert ${transfer.reference}`,
          businessId: transfer.destinationBusiness
        }, session);
      }
    }

    await session.commitTransaction();
    session.endSession();

    return transfer;

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

/**
 * Liste les transferts d'une boutique
 */
export async function getTransfers({ 
  businessId, 
  type = 'all', 
  status = null, 
  limit = 20, 
  page = 1 
}) {
  try {
    const query = {};

    // Type: 'sent', 'received', 'all'
    if (type === 'sent') {
      query.sourceBusiness = new mongoose.Types.ObjectId(businessId);
    } else if (type === 'received') {
      query.destinationBusiness = new mongoose.Types.ObjectId(businessId);
    } else {
      query.$or = [
        { sourceBusiness: new mongoose.Types.ObjectId(businessId) },
        { destinationBusiness: new mongoose.Types.ObjectId(businessId) }
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const transfers = await StockTransfer.find(query)
      .populate('sourceBusiness', 'name')
      .populate('destinationBusiness', 'name')
      .populate('items.sourceProductId', 'nom reference')
      .populate('items.destinationProductId', 'nom reference')
      .populate('createdBy', 'nom prenom')
      .populate('validatedBy', 'nom prenom')
      .populate('receivedBy', 'nom prenom')
      .sort({ transferDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await StockTransfer.countDocuments(query);

    return {
      transfers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (err) {
    console.error("getTransfers error:", err);
    throw new HttpError(500, "Erreur lors de la récupération des transferts");
  }
}