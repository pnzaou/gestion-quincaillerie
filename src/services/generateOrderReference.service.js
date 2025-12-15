import Order from "@/models/Order.model";

/**
 * Génère une référence unique pour une commande par boutique
 * Format: CMD-YYYYMMDD-XXX
 */
export async function generateOrderReference(date, businessId, session) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `CMD-${year}${month}${day}`;

  // Compter les commandes du jour pour cette boutique
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await Order.countDocuments({
    business: businessId,
    orderDate: { $gte: startOfDay, $lte: endOfDay }
  }).session(session);

  const sequence = String(count + 1).padStart(3, '0');
  return `${datePrefix}-${sequence}`;
}