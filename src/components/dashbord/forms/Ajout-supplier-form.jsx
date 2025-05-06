"use client"

import Required from "@/components/Required";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const AjoutSupplierForm = ({className, initialData = null, ...props}) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, control, formState: { errors }, setValue, getValues, trigger } = useForm();

    const isEdit = Boolean(initialData)

    useEffect(() => {
        if (isEdit) {
            setValue("nom", initialData.nom);
            setValue("adresse", initialData.adresse);
            setValue("telephone", initialData.telephone);
            setValue("email", initialData.email);
        }
    },[initialData, setValue, isEdit])

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const url = isEdit ? `/api/supplier/${initialData._id}` : "/api/supplier";
            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            const rep = await response.json();

            if (response.ok) {
                toast.success(rep.message);
            } else {
                toast.error(rep.message);
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajout de l'utilisateur. Veuillez réessayer.");
            console.error(error);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        (<div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>{isEdit ? "Modifier le fournisseur" : "Ajouter un fournisseur"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="grid gap-3 flex-1">
                                    <Label>Nom<Required/></Label>
                                    <Input {...register("nom", { required: true })}/>
                                    {errors.nom && <p className="text-sm text-red-500">Ce champ est requis</p>}
                                </div>
                                <div className="grid gap-3 flex-1">
                                    <Label>Adresse</Label>
                                    <Input {...register("adresse")}/>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="grid gap-3 flex-1">
                                    <Label>Téléphone<Required/></Label>
                                    <Input
                                    type="tel"
                                    placeholder="+221 7X XXX XXXX"
                                    {...register("telephone", { 
                                        required: "Ce champ est requis",
                                        pattern: {
                                            value: /^\+221\s?(7[05678])\s?\d{3}\s?\d{4}$/,
                                            message: "Format invalide. Ex: +221 77 123 4567",
                                        }
                                    })}         
                                    />
                                    {errors.telephone && (<p className="text-sm text-red-500">{errors.telephone.message}</p> )}
                                </div>
                                <div className="grid gap-3 flex-1">
                                    <Label>Email</Label>
                                    <Input type="email" {...register("email")} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 mt-10">
                            <Button type="submit" className="w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer">
                            {isLoading 
                            ? (
                                <>
                                    <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span> {isEdit ? "Mise à jour..." : "Enregistrement..."}
                                </>
                            ) 
                            : (
                                isEdit ? "Mettre à jour" : "Enregistrer"
                            )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>)
    );
}

export default AjoutSupplierForm;
