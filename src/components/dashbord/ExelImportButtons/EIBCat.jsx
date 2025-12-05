"use client"

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import BoutonImp from "./BoutonImp";

const EIBCat = () => {
    const router = useRouter()
    const params = useParams()
    const shopId = params?.shopId
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("businessId", shopId); // Ajout du businessId

        try {
            setIsLoading(true)

            const res = await fetch("/api/category/import-excel", {
                method: "POST",
                body: formData,
            })

            const data = await res.json();

            if(!res.ok || data.error) {
                toast.error(data.message || "Une erreur est survenue.", {duration: 6000})
                return;
            }

            toast.success(data.message || "Importation réussie.", {duration: 6000})
            router.push(`/shop/${shopId}/dashboard/categorie/liste`) // Mise à jour de la redirection

        } catch (error) {
            console.error("Erreur lors de l'importation :", error)
            toast.error("Une erreur est survenue. Veuillez réessayer.", {duration: 6000})
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <BoutonImp handleChange={handleChange} isLoading={isLoading}/>
        </>
    );
}

export default EIBCat;