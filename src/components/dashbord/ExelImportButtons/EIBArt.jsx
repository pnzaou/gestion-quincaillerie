"use client"

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import BoutonImp from "./BoutonImp";
import toast from "react-hot-toast";

const EIBArt = () => {
    const router = useRouter();
    const params = useParams();
    const shopId = params?.shopId;
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("businessId", shopId);

        try {
            setIsLoading(true);

            const res = await fetch("/api/product/import-excel", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if(!res.ok || data.error) {
                toast.error(data.message || "Une erreur est survenue.", {duration: 6000});
                return;
            }

            toast.success(data.message || "Importation réussie.", {duration: 6000});
            router.push(`/shop/${shopId}/dashboard/article/stock`);
            router.refresh();

        } catch (error) {
            console.error("Erreur lors de l'importation :", error);
            toast.error("Une erreur est survenue. Veuillez réessayer.", {duration: 6000});
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <BoutonImp handleChange={handleChange} isLoading={isLoading}/>
        </>
    );
}

export default EIBArt;