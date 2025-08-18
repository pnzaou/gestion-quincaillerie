// schemas.js
import * as yup from "yup";

export const addUserSchema = (isEdit = false) =>
  yup.object().shape({
    nom: yup.string().required("Ce champ est obligatoire!"),
    prenom: yup.string().required("Ce champ est obligatoire!"),
    email: yup.string().email("Email invalide").required("L'email est obligatoire."),
    password: yup
      .string()
      // transforme la chaîne vide en undefined pour que les règles suivantes
      // ne s'appliquent pas si l'utilisateur laisse le champ vide en édition
      .transform((value) => (value === "" ? undefined : value))
      .when([], {
        is: () => isEdit,
        then: (schema) =>
          schema
            .notRequired()
            .min(8, "Le mot de passe doit avoir au moins 8 caractères")
            .matches(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
              "Minimum: 1 maj, 1 min, 1 chiffre, 1 spé"
            )
            .max(20, "Le mot de passe ne peut pas dépasser 20 caractères."),
        otherwise: (schema) =>
          schema
            .required("Le mot de passe est obligatoire.")
            .min(8, "Le mot de passe doit avoir au moins 8 caractères")
            .matches(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
              "Minimum: 1 maj, 1 min, 1 chiffre, 1 spé"
            )
            .max(20, "Le mot de passe ne peut pas dépasser 20 caractères."),
      }),
    role: yup
      .string()
      .oneOf(["admin", "gerant", "comptable"], "Rôle invalide — choisissez Admin, Gérant ou Comptable.")
      .required("Le rôle est obligatoire."),
  });
