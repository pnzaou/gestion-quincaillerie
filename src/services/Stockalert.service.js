import StockAlert from "@/components/email/Get-Stock-Alert";
import { resend } from "@/lib/resend";
import Notification from "@/models/Notification.model";
import Product from "@/models/Product.model";
import User from "@/models/User.model";
import mongoose from "mongoose";

/**
 * Récupère les utilisateurs à notifier pour une alerte stock
 * - Admins : tous
 * - Comptables : tous
 * - Gérants : uniquement ceux de la même boutique
 */
async function getUsersToNotify(businessId) {
  const users = await User.find({
    status: "actif",
    $or: [
      { role: "admin" },
      { role: "comptable" },
      { role: "gerant", business: businessId }
    ]
  }).select("_id email nom prenom role");

  return users;
}

/**
 * Crée une notification en base de données
 */
async function createNotification({ 
  businessId, 
  recipientId, 
  type, 
  priority, 
  title, 
  message, 
  productId, 
  productName, 
  currentStock, 
  alertThreshold,
  saleReference,
  session 
}) {
  const notification = {
    business: businessId,
    recipient: recipientId,
    type,
    priority,
    title,
    message,
    relatedResource: {
      resourceType: "product",
      resourceId: productId
    },
    metadata: {
      productName,
      currentStock,
      alertThreshold,
      saleReference
    }
  };

  if (session) {
    await Notification.create([notification], { session });
  } else {
    await Notification.create(notification);
  }
}

/**
 * Envoie un email d'alerte stock avec React Email
 */
async function sendStockAlertEmail({ 
  userEmail, 
  userName, 
  productName, 
  currentStock, 
  alertThreshold, 
  businessName, 
  isOutOfStock,
  isNegativeStock 
}) {
  try {
    let subject;
    if (isNegativeStock) {
      subject = `🔴 Stock négatif - ${productName}`;
    } else if (isOutOfStock) {
      subject = `🚨 Rupture de stock - ${productName}`;
    } else {
      subject = `⚠️ Alerte stock - ${productName}`;
    }

    await resend.emails.send({
      from: "Support StockProx <onboarding@resend.dev>",
      to: userEmail,
      subject,
      react: (
        <StockAlert
          alertThreshold={alertThreshold}
          businessName={businessName}
          currentStock={currentStock}
          isOutOfStock={isOutOfStock || isNegativeStock}
          productName={productName}
          stockUrl={`${process.env.NEXT_PUBLIC_APP_URL}/shop/dashboard/article/stock`}
          userName={userName}
        />
      ),
    });

    console.log(`✅ Email envoyé à ${userEmail} pour ${productName}`);
  } catch (error) {
    console.error(`❌ Erreur envoi email à ${userEmail}:`, error);
  }
}

/**
 * Vérifie le stock d'un produit et envoie alertes si nécessaire
 * À appeler APRÈS la mise à jour du stock
 */
export async function checkStockAndNotify({ 
  productId, 
  businessId, 
  saleReference = null,
  session = null 
}) {
  try {
    // Récupérer le produit avec populate business pour le nom
    const product = await Product.findById(productId)
      .populate("business", "name")
      .session(session);

    if (!product) {
      console.warn(`Produit ${productId} introuvable pour vérification stock`);
      return;
    }

    const currentStock = product.QteStock;
    const alertThreshold = product.QteAlerte;

    // ✅ Trois états possibles :
    const isNegativeStock = currentStock < 0; // Stock négatif (priorité max)
    const isOutOfStock = currentStock === 0; // Rupture exacte
    const isLowStock = currentStock > 0 && currentStock <= alertThreshold && alertThreshold > 0; // Stock faible

    // Rien à signaler
    if (!isNegativeStock && !isOutOfStock && !isLowStock) {
      return;
    }

    // Récupérer les utilisateurs à notifier
    const users = await getUsersToNotify(businessId);

    if (users.length === 0) {
      console.warn("Aucun utilisateur à notifier pour alerte stock");
      return;
    }

    const businessName = product.business?.name || "Votre boutique";

    // ✅ Déterminer le type, la priorité, le titre et le message selon la situation
    let notificationType, priority, title, message;

    if (isNegativeStock) {
      notificationType = "negative_stock";
      priority = "urgent";
      title = `🔴 Stock négatif : ${product.nom}`;
      message = `Le produit "${product.nom}" est en stock négatif (${currentStock} unités). Réapprovisionnement urgent nécessaire.`;
    } else if (isOutOfStock) {
      notificationType = "stock_out";
      priority = "urgent";
      title = `🚨 Rupture de stock : ${product.nom}`;
      message = `Le produit "${product.nom}" est en rupture de stock (0 unités restantes).`;
    } else {
      notificationType = "low_stock";
      priority = "high";
      title = `⚠️ Stock faible : ${product.nom}`;
      message = `Le produit "${product.nom}" a atteint le seuil d'alerte (${currentStock}/${alertThreshold} unités).`;
    }

    // Créer notifications et envoyer emails pour chaque utilisateur
    const notificationPromises = users.map(async (user) => {
      // Créer notification en BD
      await createNotification({
        businessId,
        recipientId: user._id,
        type: notificationType,
        priority,
        title,
        message,
        productId: product._id,
        productName: product.nom,
        currentStock,
        alertThreshold,
        saleReference,
        session
      });

      // Envoyer email (async, ne bloque pas)
      sendStockAlertEmail({
        userEmail: user.email,
        userName: `${user.prenom} ${user.nom}`,
        productName: product.nom,
        currentStock,
        alertThreshold,
        businessName,
        isOutOfStock: isOutOfStock || isNegativeStock,
        isNegativeStock
      });
    });

    await Promise.all(notificationPromises);

    console.log(`✅ ${users.length} notifications créées pour ${product.nom}`);
  } catch (error) {
    console.error("Erreur checkStockAndNotify:", error);
    // On ne relance pas l'erreur pour ne pas faire échouer la transaction de vente
  }
}

/**
 * Vérifie le stock pour plusieurs produits (après une vente)
 */
export async function checkStockForSaleItems({ items, businessId, saleReference, session = null }) {
  const checkPromises = items.map(item => 
    checkStockAndNotify({
      productId: item.product,
      businessId,
      saleReference,
      session
    })
  );

  await Promise.all(checkPromises);
}