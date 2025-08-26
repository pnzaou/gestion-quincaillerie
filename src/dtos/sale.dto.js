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
    amountPaid: raw.amountPaid != null ? Number(raw.amountPaid) : 0,
    paymentMethod: raw.paymentMethod || null,
  };

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

  // règles métier déjà présentes : si partial/pending => client requis
  if ((payload.status === "partial" || payload.status === "pending") && !raw.client) {
    errors.push("Infos du client obligatoires en cas d’acompte ou de vente à crédit.");
  }

  // si partial => amountPaid présent et valide
  if (payload.status === "partial" && (!Number.isFinite(payload.amountPaid) || payload.amountPaid <= 0)) {
    errors.push("Pour status 'partial', amountPaid doit être renseigné et > 0.");
  }

  return { valid: errors.length === 0, errors, payload };
}
