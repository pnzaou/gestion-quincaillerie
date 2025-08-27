export const SALE_STATUSES = ["paid", "pending", "partial", "cancelled"];

export function validateSalePayload(raw) {
  const errors = [];

  const payload = {
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

      // ancien champ pour prélèvement depuis le compte
      if (raw.amountFromAccount != null && Number(raw.amountFromAccount) > 0) {
        list.push({ method: "account", amount: Number(raw.amountFromAccount) });
      }

      // ancien format : amountPaid + paymentMethod (unique)
      if (raw.amountPaid != null && Number(raw.amountPaid) > 0) {
        const method = raw.paymentMethod || "espèce";
        // si front envoyait paymentMethod === "account" et amountFromAccount manquant,
        // cette entrée sera traitée comme account (compatible avec la logique serveur).
        list.push({ method, amount: Number(raw.amountPaid) });
      }

      return list;
    })(),

    // champs auxiliaires utiles pour validations / logique métier (optionnel)
    paymentsSum: 0,
    accountTotal: 0
  };

  // calculer sommes utiles (après la construction du payload)
  payload.paymentsSum = payload.payments.reduce((s, p) => s + p.amount, 0);
  payload.accountTotal = payload.payments
    .filter(p => p.method === "account")
    .reduce((s, p) => s + p.amount, 0);

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

  // ---- validations liées aux paiements ----
  // chaque paiement doit avoir method (string) et amount > 0
  for (const [i, p] of payload.payments.entries()) {
    if (!p.method || typeof p.method !== "string") errors.push(`payments[${i}].method est requis.`);
    if (!Number.isFinite(p.amount) || p.amount <= 0) errors.push(`payments[${i}].amount doit être > 0.`);
  }

  // la somme des paiements ne doit pas dépasser le total
  if (payload.paymentsSum > payload.total) {
    errors.push("La somme des paiements dépasse le total.");
  }

  // si un paiement 'account' est présent, il faut un client
  if (payload.accountTotal > 0 && !raw.client) {
    errors.push("Client requis si paiement depuis le compte (method: 'account').");
  }

  // cohérence status <-> paiements
  // paid  => paymentsSum === total
  if (payload.status === "paid" && payload.paymentsSum !== payload.total) {
    errors.push("Pour status 'paid', la somme des paiements doit être égale au total.");
  }
  // partial => 0 < paymentsSum < total
  if (payload.status === "partial" && !(payload.paymentsSum > 0 && payload.paymentsSum < payload.total)) {
    errors.push("Pour status 'partial', il doit exister au moins un paiement > 0 et < total.");
  }
  // pending => paymentsSum === 0 (vente enregistrée sans paiement immédiat)
  if (payload.status === "pending" && payload.paymentsSum !== 0) {
    errors.push("Pour status 'pending', aucun paiement immédiat attendu (paymentsSum doit être 0).");
  }

  // si partial/pending => client requis
  if ((payload.status === "partial" || payload.status === "pending") && !raw.client) {
    errors.push("Infos du client obligatoires en cas d’acompte ou de vente à crédit.");
  }

  return { valid: errors.length === 0, errors, payload };
}
