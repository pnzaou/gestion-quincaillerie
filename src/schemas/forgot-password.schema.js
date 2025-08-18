import * as yup from "yup";

export const userForgotPassword = yup.object().shape({
  email: yup
    .string()
    .email("Email invalide")
    .required("L'email est obligatoire."),
});