export const SALE_STATUSES = ["paid", "pending", "partial", "cancelled"];

export function validateSalePayload(raw) {
  const errors = [];

  const payload = {
    businessId: raw.businessId,
    reference: raw.reference,
    client: raw.client || null,

    items: Array.isArray(raw.items) ? raw.items.map(i => ({
      product: i.product,
      quantity: Number(i.quantity),
      price: Number(i.price)
    })) : [],

    dateExacte: raw.dateExacte ? new Date(raw.dateExacte) : new Date(),
    remise: raw.remise != null ? Number(raw.remise) : 0,
    total: raw.total != null ? Number(raw.total) : NaN,
    vendeur: raw.vendeur || null,
    status: raw.status,
    
    payments: (() => {
      if (Array.isArray(raw.payments)) {
        return raw.payments
          .map(p => ({ method: p.method ? String(p.method).trim() : p.method, amount: Number(p.amount) }))
          .filter(p => p.method && Number.isFinite(p.amount) && p.amount > 0);
      }

      const list = [];

      if (raw.amountFromAccount != null && Number(raw.amountFromAccount) > 0) {
        list.push({ method: "account", amount: Number(raw.amountFromAccount) });
      }

      if (raw.amountPaid != null && Number(raw.amountPaid) > 0) {
        const method = raw.paymentMethod || "espèce";
        list.push({ method, amount: Number(raw.amountPaid) });
      }

      return list;
    })(),

    paymentsSum: 0,
    accountTotal: 0
  };

  payload.paymentsSum = payload.payments.reduce((s, p) => s + p.amount, 0);
  payload.accountTotal = payload.payments
    .filter(p => p.method === "account")
    .reduce((s, p) => s + p.amount, 0);

  // ✅ Fonction helper pour comparer avec tolérance d'arrondi
  const isEqual = (a, b, tolerance = 0.01) => Math.abs(a - b) < tolerance;

  // Validation businessId
  if (!payload.businessId) {
    errors.push("businessId est obligatoire.");
  }

  if (!payload.items.length) errors.push("items est obligatoire et doit être un tableau non vide.");
  else {
    payload.items.forEach((it, idx) => {
      if (!it.product) errors.push(`items[${idx}].product est obligatoire.`);
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) errors.push(`items[${idx}].quantity invalide.`);
      if (!Number.isFinite(it.price) || it.price < 0) errors.push(`items[${idx}].price invalide.`);
    });
  }

  if (!Number.isFinite(payload.total) || payload.total < 0) errors.push("total est obligatoire et doit être un nombre >= 0.");

  if (!payload.status || !SALE_STATUSES.includes(payload.status)) {
    errors.push("status manquant ou invalide. Valeurs acceptées: " + SALE_STATUSES.join(", "));
  }

  for (const [i, p] of payload.payments.entries()) {
    if (!p.method || typeof p.method !== "string") errors.push(`payments[${i}].method est requis.`);
    if (!Number.isFinite(p.amount) || p.amount <= 0) errors.push(`payments[${i}].amount doit être > 0.`);
  }

  // ✅ Utiliser tolérance d'arrondi pour les comparaisons
  if (payload.paymentsSum > payload.total + 0.01) {
    errors.push("La somme des paiements dépasse le total.");
  }

  if (payload.accountTotal > 0 && !raw.client) {
    errors.push("Client requis si paiement depuis le compte (method: 'account').");
  }

  // ✅ Comparaison avec tolérance pour status 'paid'
  if (payload.status === "paid" && !isEqual(payload.paymentsSum, payload.total)) {
    errors.push(
      `Pour status 'paid', la somme des paiements (${payload.paymentsSum.toFixed(2)}) doit être égale au total (${payload.total.toFixed(2)}).`
    );
  }

  if (payload.status === "partial" && !(payload.paymentsSum > 0 && payload.paymentsSum < payload.total)) {
    errors.push("Pour status 'partial', il doit exister au moins un paiement > 0 et < total.");
  }

  // ✅ Comparaison avec tolérance pour status 'pending'
  if (payload.status === "pending" && !isEqual(payload.paymentsSum, 0)) {
    errors.push("Pour status 'pending', aucun paiement immédiat attendu (paymentsSum doit être 0).");
  }

  if ((payload.status === "partial" || payload.status === "pending") && !raw.client) {
    errors.push("Infos du client obligatoires en cas d'acompte ou de vente à crédit.");
  }

  return { valid: errors.length === 0, errors, payload };
}