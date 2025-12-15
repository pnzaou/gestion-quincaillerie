export const ORDER_STATUSES = ["draft", "sent", "confirmed", "partially_received", "completed", "cancelled"];

export function validateOrderPayload(raw) {
  const errors = [];

  const payload = {
    businessId: raw.businessId,
    supplier: raw.supplier || null,
    
    items: Array.isArray(raw.items) ? raw.items.map(i => ({
      product: i.product,
      quantity: Number(i.quantity),
      price: Number(i.price)
    })) : [],

    orderDate: raw.orderDate ? new Date(raw.orderDate) : new Date(),
    expectedDelivery: raw.expectedDelivery ? new Date(raw.expectedDelivery) : null,
    notes: raw.notes ? String(raw.notes).trim() : "",
    total: raw.total != null ? Number(raw.total) : NaN,
  };

  // Validation businessId
  if (!payload.businessId) {
    errors.push("businessId est obligatoire.");
  }

  // Validation items
  if (!payload.items.length) {
    errors.push("items est obligatoire et doit être un tableau non vide.");
  } else {
    payload.items.forEach((it, idx) => {
      if (!it.product) errors.push(`items[${idx}].product est obligatoire.`);
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
        errors.push(`items[${idx}].quantity invalide.`);
      }
      if (!Number.isFinite(it.price) || it.price < 0) {
        errors.push(`items[${idx}].price invalide.`);
      }
    });
  }

  // Validation total
  if (!Number.isFinite(payload.total) || payload.total < 0) {
    errors.push("total est obligatoire et doit être un nombre >= 0.");
  }

  // Validation dates
  if (payload.expectedDelivery && payload.expectedDelivery < payload.orderDate) {
    errors.push("La date de livraison attendue ne peut pas être antérieure à la date de commande.");
  }

  return { valid: errors.length === 0, errors, payload };
}