export const SALE_STATUSES = ["paid", "pending", "partial", "cancelled"];

export function validateSalePayload(raw) {
  const errors = [];

  const payload = {
    businessId: raw.businessId,
    reference: raw.reference,
    client: raw.client || null,

    items: Array.isArray(raw.items) ? raw.items.map(i => {
      // ✅ Arrondir à 2 décimales dès la conversion
      const quantity = Math.round(Number(i.quantity) * 100) / 100;
      const price = Math.round(Number(i.price) * 100) / 100;
      
      return {
        product: i.product,
        quantity,
        price
      };
    }) : [],

    dateExacte: raw.dateExacte ? new Date(raw.dateExacte) : new Date(),
    remise: raw.remise != null ? Math.round(Number(raw.remise) * 100) / 100 : 0,
    total: raw.total != null ? Math.round(Number(raw.total) * 100) / 100 : NaN,
    vendeur: raw.vendeur || null,
    status: raw.status,
    
    payments: (() => {
      if (Array.isArray(raw.payments)) {
        return raw.payments
          .map(p => ({ 
            method: p.method ? String(p.method).trim() : p.method, 
            amount: Math.round(Number(p.amount) * 100) / 100 
          }))
          .filter(p => p.method && Number.isFinite(p.amount) && p.amount > 0);
      }

      const list = [];

      if (raw.amountFromAccount != null && Number(raw.amountFromAccount) > 0) {
        list.push({ 
          method: "account", 
          amount: Math.round(Number(raw.amountFromAccount) * 100) / 100 
        });
      }

      if (raw.amountPaid != null && Number(raw.amountPaid) > 0) {
        const method = raw.paymentMethod || "espèce";
        list.push({ 
          method, 
          amount: Math.round(Number(raw.amountPaid) * 100) / 100 
        });
      }

      return list;
    })(),

    paymentsSum: 0,
    accountTotal: 0
  };

  payload.paymentsSum = Math.round(payload.payments.reduce((s, p) => s + p.amount, 0) * 100) / 100;
  payload.accountTotal = Math.round(payload.payments
    .filter(p => p.method === "account")
    .reduce((s, p) => s + p.amount, 0) * 100) / 100;

  const isEqual = (a, b, tolerance = 0.01) => Math.abs(a - b) < tolerance;

  if (!payload.businessId) {
    errors.push("businessId est obligatoire.");
  }

  if (!payload.items.length) {
    errors.push("items est obligatoire et doit être un tableau non vide.");
  } else {
    payload.items.forEach((it, idx) => {
      if (!it.product) errors.push(`items[${idx}].product est obligatoire.`);
      
      // ✅ Validation décimales
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
        errors.push(`items[${idx}].quantity invalide.`);
      }
      
      // ✅ Optionnel : Vérifier max 2 décimales
      const decimalPlaces = (it.quantity.toString().split('.')[1] || '').length;
      if (decimalPlaces > 2) {
        errors.push(`items[${idx}].quantity ne peut avoir plus de 2 décimales.`);
      }
      
      if (!Number.isFinite(it.price) || it.price < 0) {
        errors.push(`items[${idx}].price invalide.`);
      }
    });
  }

  if (!Number.isFinite(payload.total) || payload.total < 0) {
    errors.push("total est obligatoire et doit être un nombre >= 0.");
  }

  if (!payload.status || !SALE_STATUSES.includes(payload.status)) {
    errors.push("status manquant ou invalide. Valeurs acceptées: " + SALE_STATUSES.join(", "));
  }

  for (const [i, p] of payload.payments.entries()) {
    if (!p.method || typeof p.method !== "string") {
      errors.push(`payments[${i}].method est requis.`);
    }
    if (!Number.isFinite(p.amount) || p.amount <= 0) {
      errors.push(`payments[${i}].amount doit être > 0.`);
    }
  }

  if (payload.paymentsSum > payload.total + 0.01) {
    errors.push("La somme des paiements dépasse le total.");
  }

  if (payload.accountTotal > 0 && !raw.client) {
    errors.push("Client requis si paiement depuis le compte (method: 'account').");
  }

  if (payload.status === "paid" && !isEqual(payload.paymentsSum, payload.total)) {
    errors.push(
      `Pour status 'paid', la somme des paiements (${payload.paymentsSum.toFixed(2)}) doit être égale au total (${payload.total.toFixed(2)}).`
    );
  }

  if (payload.status === "partial" && !(payload.paymentsSum > 0 && payload.paymentsSum < payload.total)) {
    errors.push("Pour status 'partial', il doit exister au moins un paiement > 0 et < total.");
  }

  if (payload.status === "pending" && !isEqual(payload.paymentsSum, 0)) {
    errors.push("Pour status 'pending', aucun paiement immédiat attendu (paymentsSum doit être 0).");
  }

  if ((payload.status === "partial" || payload.status === "pending") && !raw.client) {
    errors.push("Infos du client obligatoires en cas d'acompte ou de vente à crédit.");
  }

  return { valid: errors.length === 0, errors, payload };
}