// schemas/changeDefaultPassword.schema.ts
import * as yup from "yup";

const mdpRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const changeDefaultPasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required("Le mot de passe actuel est requis"),

  newPassword: yup
    .string()
    .required("Le nouveau mot de passe est requis")
    .matches(
      mdpRegex,
      "Minimum: 1 maj, 1 min, 1 chiffre, 1 spé"
    ),

  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("newPassword")],
      "Les mots de passe ne correspondent pas"
    )
    .required("Veuillez confirmer le mot de passe"),
});
