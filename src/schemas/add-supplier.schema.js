// schemas.js
import * as yup from "yup";

export const addSupplierSchema = yup.object().shape({
    nom: yup.string().required("Ce champ est obligatoire!"),
    telephone: yup.string()
        .matches(
            /^\+221\s?(7[05678])\s?\d{3}\s?\d{4}$/,
            "Format invalide. Ex: +221 77 123 4567"
        )
        .required("Le mot de passe est obligatoire."),
    adresse: yup.string(),
    email: yup.string().email("Email invalide"),
});
