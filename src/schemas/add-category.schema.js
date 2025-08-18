import * as yup from "yup"

export const addCategorySchema = yup.object().shape({
    nom: yup.string().required("Ce champ est obligatoire!"),
    description: yup.string()
})