import Sale from "@/models/Sale.model";

export async function generateReference(date, session = null) {
  const D = String(date.getDate()).padStart(2, '0');
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const Y = date.getFullYear();
  const prefix = `VENTE-${Y}/${M}/${D}-`;

  const count = await Sale.countDocuments({
    reference: { $regex: `^${prefix}\\d{3}$` },
  }).session(session);

  const seq = String(count + 1).padStart(3, '0');
  return `${prefix}${seq}`;
}