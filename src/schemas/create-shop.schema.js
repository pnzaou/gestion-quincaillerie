import * as yup from "yup";

export const createShopSchema = yup.object().shape({
  name: yup.string().required("Le nom de la boutique est obligatoire."),
  email: yup
    .string()
    .email("Email invalide")
    .required("L'email est obligatoire."),
  phone: yup
    .string()
    .matches(
      /^\s*(?:(?:\+|00)\s*221|00221|221)?[\s.-]*(?:\d[\s.-]*){9}\s*$/,
      "Numéro de téléphone invalide"
    )
    .required("Le numéro de téléphone est obligatoire."),
  address: yup.string().optional(),
  website: yup.string().url("URL invalide").optional(),
});