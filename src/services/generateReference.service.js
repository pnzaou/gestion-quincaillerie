import Sale from "@/models/Sale.model";

export async function generateReference(date, businessId, session) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `VENTE-${year}${month}${day}`;

  // ✅ Compter les ventes du jour pour cette boutique
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await Sale.countDocuments({
    business: businessId, // ✅ Filtrer par boutique
    dateExacte: { $gte: startOfDay, $lte: endOfDay }
  }).session(session);

  const sequence = String(count + 1).padStart(3, '0');
  return `${datePrefix}-${sequence}`;
}