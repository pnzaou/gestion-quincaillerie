import * as yup from "yup";

export const articleSchema = yup.object({
  // Step 1
  nom: yup
    .string()
    .trim()
    .required("Le nom est requis"),
  category_id: yup
    .string()
    .required("La catégorie est requise"),
  prixAchat: yup
    .number()
    .typeError("Doit être un nombre")
    .positive("Doit être un nombre positif")
    .required("Le prix d'achat est requis"),
  prixVente: yup
    .number()
    .typeError("Doit être un nombre")
    .positive("Doit être un nombre positif")
    .required("Le prix de vente est requis"),

  // Step 2
  supplier_id: yup.string().nullable().optional(),
  QteInitial: yup
    .number()
    .typeError("Doit être un nombre")
    .min(0, "Doit être ≥ 0")
    .required("La quantité initiale est requise"),
  QteStock: yup
    .number()
    .typeError("Doit être un nombre")
    .min(0, "Doit être ≥ 0")
    .required("La quantité en stock est requise"),
  QteAlerte: yup
    .number()
    .typeError("Doit être un nombre")
    .min(0, "Doit être ≥ 0")
    .required("La quantité d'alerte est requise"),
  reference: yup.string().optional(),
  dateExpiration: yup.string().optional(),

  // Step 3
  image: yup.mixed().optional(),
  description: yup.string().optional(),
});