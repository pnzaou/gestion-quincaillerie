import mongoose from "mongoose";
import Order from "@/models/Order.model";
import Product from "@/models/Product.model";
import { generateOrderReference } from "./generateOrderReference.service";
import { createHistory } from "./history.service";
import { HttpError } from "./errors.service";
import PurchaseHistory from "@/models/PurchaseHistory.model";

/**
 * Créer une commande
 */
export async function createOrder({ payload, user }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!payload.businessId) {
      throw new HttpError(400, "ID de la boutique manquant.");
    }

    const businessObjectId = new mongoose.Types.ObjectId(payload.businessId);

    // 1) Générer la référence
    const now = new Date(payload.orderDate || Date.now());
    const reference = await generateOrderReference(now, businessObjectId, session);

    // 2) Vérifier que tous les produits existent et appartiennent à la boutique
    for (const item of payload.items) {
      const product = await Product.findOne({
        _id: item.product,
        business: businessObjectId
      }).session(session);

      if (!product) {
        throw new HttpError(404, `Produit ${item.product} introuvable dans cette boutique`);
      }
    }

    // 3) Créer la commande
    const data = {
      business: businessObjectId,
      reference,
      supplier: payload.supplier || null,
      items: payload.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        estimatedPrice: item.price, // ✅ Changé de "price" à "estimatedPrice"
        actualPrice: null,
        receivedQuantity: 0,
        status: "pending",
        receptions: [],
      })),
      status: "draft",
      orderDate: payload.orderDate || now,
      expectedDelivery: payload.expectedDelivery || null,
      createdBy: user?.id,
      notes: payload.notes || "",
      estimatedTotal: payload.total, // ✅ Changé de "total" à "estimatedTotal"
      actualTotal: 0,
      priceVariance: 0,
    };

    const [order] = await Order.create([data], { session });

    // 4) Créer l'historique
    const description = `Commande ${reference} créée pour un montant de ${payload.total} FCFA. ${payload.items.length} article(s).`;
    
    await createHistory({
      userId: user?.id,
      action: "create",
      resource: "order",
      resourceId: order._id,
      description,
      businessId: businessObjectId
    }, session);

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.status && err.message) throw err;
    console.error("createOrder unexpected error:", err);
    throw new HttpError(500, "Erreur lors de la création de la commande.");
  }
}

/**
 * Recevoir une commande (complète ou partielle)
 */
export async function receiveOrder({ orderId, items, user, businessId }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      business: businessId
    }).session(session);

    if (!order) {
      throw new HttpError(404, "Commande introuvable dans cette boutique");
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new HttpError(400, `Impossible de recevoir une commande avec le statut ${order.status}`);
    }

    // items = [{ productId, receivedQuantity, actualPrice }]
    let allReceived = true;
    let actualTotal = order.actualTotal || 0;

    for (const receivedItem of items) {
      const orderItem = order.items.find(
        item => item.product.toString() === receivedItem.productId
      );

      if (!orderItem) {
        throw new HttpError(404, `Produit ${receivedItem.productId} non trouvé dans la commande`);
      }

      // Vérifier la quantité
      const newReceivedQty = orderItem.receivedQuantity + receivedItem.receivedQuantity;
      
      if (newReceivedQty > orderItem.quantity) {
        throw new HttpError(400, `Quantité reçue dépasse la quantité commandée pour le produit ${receivedItem.productId}`);
      }

      // Valider le prix réel
      if (!receivedItem.actualPrice || receivedItem.actualPrice <= 0) {
        throw new HttpError(400, `Prix réel invalide pour le produit ${receivedItem.productId}`);
      }

      // Mettre à jour la quantité reçue
      orderItem.receivedQuantity = newReceivedQty;

      // Ajouter à l'historique des réceptions de cet item
      orderItem.receptions.push({
        date: new Date(),
        quantity: receivedItem.receivedQuantity,
        actualPrice: receivedItem.actualPrice,
        receivedBy: user?.id,
        notes: receivedItem.notes || ""
      });

      // Calculer le prix réel moyen pour cet item
      const totalQtyReceived = orderItem.receptions.reduce((sum, r) => sum + r.quantity, 0);
      const totalCost = orderItem.receptions.reduce((sum, r) => sum + (r.quantity * r.actualPrice), 0);
      orderItem.actualPrice = totalCost / totalQtyReceived;

      // Mettre à jour le statut de l'item
      if (newReceivedQty === orderItem.quantity) {
        orderItem.status = 'received';
      } else if (newReceivedQty > 0) {
        orderItem.status = 'partially_received';
        allReceived = false;
      } else {
        allReceived = false;
      }

      // Mettre à jour le total réel de la commande
      actualTotal += receivedItem.receivedQuantity * receivedItem.actualPrice;

      // ✅ Créer l'historique d'achat
      await PurchaseHistory.create([{
        business: businessId,
        product: receivedItem.productId,
        order: order._id,
        supplier: order.supplier,
        quantity: receivedItem.receivedQuantity,
        unitPrice: receivedItem.actualPrice,
        totalCost: receivedItem.receivedQuantity * receivedItem.actualPrice,
        receivedDate: new Date(),
        receivedBy: user?.id,
        notes: receivedItem.notes || ""
      }], { session });

      // Mettre à jour le stock du produit
      const product = await Product.findOne({
        _id: receivedItem.productId,
        business: businessId
      }).session(session);

      if (!product) {
        throw new HttpError(404, `Produit ${receivedItem.productId} introuvable`);
      }

      product.QteStock += receivedItem.receivedQuantity;
      product.QteInitial += receivedItem.receivedQuantity;

      // Mettre à jour le statut du produit
      if (product.QteStock > 0) {
        product.statut = "En stock";
      }

      await product.save({ session });
    }

    // Mettre à jour les totaux de la commande
    order.actualTotal = actualTotal;
    order.priceVariance = actualTotal - order.estimatedTotal;

    // Vérifier si tous les items sont reçus
    const allItemsReceived = order.items.every(item => item.status === 'received');
    
    if (allItemsReceived) {
      order.status = 'completed';
      order.receivedDate = new Date();
    } else if (order.items.some(item => item.receivedQuantity > 0)) {
      order.status = 'partially_received';
    }

    await order.save({ session });

    // Créer l'historique
    const priceVarianceText = order.priceVariance !== 0 
      ? ` Écart de prix: ${order.priceVariance > 0 ? '+' : ''}${order.priceVariance.toFixed(2)} FCFA`
      : '';
    
    const description = `Réception ${allItemsReceived ? 'complète' : 'partielle'} de la commande ${order.reference}. ${items.length} produit(s) reçu(s).${priceVarianceText}`;
    
    await createHistory({
      userId: user?.id,
      action: "update",
      resource: "order",
      resourceId: order._id,
      description,
      businessId
    }, session);

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.status && err.message) throw err;
    console.error("receiveOrder unexpected error:", err);
    throw new HttpError(500, "Erreur lors de la réception de la commande.");
  }
}

/**
 * Mettre à jour le statut d'une commande
 */
export async function updateOrderStatus({ orderId, status, user, businessId }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      business: businessId
    }).session(session);

    if (!order) {
      throw new HttpError(404, "Commande introuvable dans cette boutique");
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save({ session });

    // Créer l'historique
    const description = `Statut de la commande ${order.reference} modifié de "${oldStatus}" à "${status}".`;
    
    await createHistory({
      userId: user?.id,
      action: "update",
      resource: "order",
      resourceId: order._id,
      description,
      businessId
    }, session);

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (err.status && err.message) throw err;
    console.error("updateOrderStatus unexpected error:", err);
    throw new HttpError(500, "Erreur lors de la mise à jour du statut.");
  }
}