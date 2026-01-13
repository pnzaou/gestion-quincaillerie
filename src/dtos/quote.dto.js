export const QUOTE_STATUSES = ["draft", "sent", "accepted", "rejected", "expired", "converted"];

export function validateQuotePayload(raw) {
  const errors = [];

  const payload = {
    businessId: raw.businessId,
    client: raw.client || null,
    items: Array.isArray(raw.items) ? raw.items.map(i => ({
      product: i.product,
      quantity: Number(i.quantity),
      price: Number(i.price)
    })) : [],
    quoteDate: raw.quoteDate ? new Date(raw.quoteDate) : new Date(),
    validUntil: raw.validUntil ? new Date(raw.validUntil) : null,
    remise: raw.remise != null ? Number(raw.remise) : 0,
    total: raw.total != null ? Number(raw.total) : NaN,
    notes: raw.notes || "",
    status: raw.status || "sent",
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

  // ✅ Validation client obligatoire pour devis
  if (!payload.client || !payload.client.nomComplet) {
    errors.push("Client obligatoire pour créer un devis.");
  }

  // Validation status
  if (payload.status && !QUOTE_STATUSES.includes(payload.status)) {
    errors.push("status invalide. Valeurs acceptées: " + QUOTE_STATUSES.join(", "));
  }

  // Validation dates
  if (payload.validUntil && payload.validUntil < payload.quoteDate) {
    errors.push("La date de validité doit être postérieure à la date du devis.");
  }

  return { valid: errors.length === 0, errors, payload };
}

export function validateConvertQuotePayload(raw) {
  const errors = [];

  const payload = {
    quoteId: raw.quoteId,
    status: raw.status || "pending",
    payments: Array.isArray(raw.payments) ? raw.payments.map(p => ({
      method: p.method ? String(p.method).trim() : p.method,
      amount: Number(p.amount)
    })).filter(p => p.method && Number.isFinite(p.amount) && p.amount > 0) : [],
  };

  if (!payload.quoteId) {
    errors.push("quoteId est obligatoire.");
  }

  if (!["paid", "pending", "partial"].includes(payload.status)) {
    errors.push("status invalide pour conversion. Valeurs: paid, pending, partial.");
  }

  payload.payments.forEach((p, i) => {
    if (!p.method || typeof p.method !== "string") {
      errors.push(`payments[${i}].method est requis.`);
    }
    if (!Number.isFinite(p.amount) || p.amount <= 0) {
      errors.push(`payments[${i}].amount doit être > 0.`);
    }
  });

  return { valid: errors.length === 0, errors, payload };
}