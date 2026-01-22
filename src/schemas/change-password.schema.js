import * as yup from "yup";

export const changePasswordSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .required("L'ancien mot de passe est obligatoire.")
    .min(8, "Le mot de passe doit avoir au moins 8 caractères")
    .max(20, "Le mot de passe ne peut pas dépasser 20 caractères.")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "Minimum: 1 maj, 1 min, 1 chiffre, 1 spé",
    ),

  newPassword: yup
    .string()
    .required("Le nouveau mot de passe est obligatoire.")
    .min(8, "Le mot de passe doit avoir au moins 8 caractères")
    .max(20, "Le mot de passe ne peut pas dépasser 20 caractères.")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "Minimum: 1 maj, 1 min, 1 chiffre, 1 spé",
    ),

  confirmNewPassword: yup
    .string()
    .required("La confirmation du mot de passe est obligatoire.")
    .oneOf(
      [yup.ref("newPassword")],
      "Les mots de passe ne correspondent pas.",
    ),
});
