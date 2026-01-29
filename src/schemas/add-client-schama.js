import * as yup from "yup"

export const addClientSchema = yup.object().shape({
  nomComplet: yup.string().trim().required("Le nom complet est obligatoire!"),
  tel: yup
    .string()
    .trim()
    .matches(
      /^\+221\s?(7[05678])\s?\d{3}\s?\d{4}$/,
      "Format invalide. Ex: +221 77 123 4567",
    )
    .required("Le numéro de téléphone est obligatoire!"),
  email: yup
    .string()
    .trim()
    .email("Email invalide")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  adresse: yup
    .string()
    .trim()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
});
