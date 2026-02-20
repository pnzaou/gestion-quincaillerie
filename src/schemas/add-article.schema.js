import * as yup from "yup";

export const articleSchema = yup.object({
  nom: yup.string().required("Ce champ est requis"),
  category_id: yup.string().required("Ce champ est requis"),
  prixAchat: yup
    .number()
    .typeError("Valeur numérique requise")
    .min(0, "La valeur doit être positive")
    .required("Ce champ est requis"),
  prixVente: yup
    .number()
    .typeError("Valeur numérique requise")
    .min(0, "La valeur doit être positive")
    .required("Ce champ est requis"),
  supplier_id: yup.string().nullable().optional(),
  QteInitial: yup
    .number()
    .typeError("Valeur numérique requise")
    .min(0, "La valeur doit être positive ou zéro")
    .required("Ce champ est requis"),
  QteStock: yup
    .number()
    .typeError("Valeur numérique requise")
    .min(0, "La valeur doit être positive ou zéro")
    .required("Ce champ est requis"),
  QteAlerte: yup
    .number()
    .typeError("Valeur numérique requise")
    .min(0, "La valeur doit être positive ou zéro")
    .required("Ce champ est requis"),
  reference: yup.string().optional(),
  dateExpiration: yup.string().optional(),
  image: yup.mixed().optional(),
  description: yup.string().optional(),
});