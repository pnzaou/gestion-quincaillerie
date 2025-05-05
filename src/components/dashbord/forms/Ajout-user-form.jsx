"use client"

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useForm, Controller } from "react-hook-form";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Required from "@/components/Required";

const AjoutUserForm = ({className, initialData = null, ...props}) => {
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, control, watch, formState: { errors }, setValue } = useForm()
    const router = useRouter()
    const mdpRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/

    const isEdit = Boolean(initialData)

    useEffect(() => {
        if (isEdit) {
            setValue("nom", initialData.nom || "");
            setValue("prenom", initialData.prenom || "");
            setValue("email", initialData.email || "");
            setValue("role", initialData.role || "");
        }
    }, [initialData, isEdit, setValue])

    const onSubmit = async (data) => {
        try {
            setIsLoading(true)

            const url = isEdit ? `/api/user/${initialData._id}` : "/api/auth/register"
            const method = isEdit ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const rep = await response.json()
            
            if (response.ok) {
                toast.success(rep.message || `Utilisateur ${ isEdit ? "modifié" : "enregistré" } avec succès.`);
                router.push("/dashboard/utilisateur/liste")
            } else {
                toast.error(rep.message || "Erreur. Veuillez réessayer.");
            }
        } catch (error) {
            toast.error("Erreur. Veuillez réessayer.");
            console.error(error);
        } finally {
            setIsLoading(false)
        }
    }

    return (
       ( <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>{isEdit ? "Modifier l'utilisateur'" : "Ajouter un utilisateur"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex gap-2 mb-4">
                            <div className="grid gap-3 flex-1/2">
                                <Label htmlFor="email">Nom<Required/></Label>
                                <Input 
                                id="nom"
                                type="nom"
                                required
                                {...register("nom", {
                                    required: true,
                                })}
                                />
                                {errors.nom && <span className="
                                mt-2 text-sm text-red-500
                                ">
                                Ce champ est obligatoire!
                                </span>}
                            </div>
                            <div className="grid gap-3 flex-1/2">
                                <div className="flex items-center">
                                <Label htmlFor="password">Prénom<Required/></Label>
                                </div>
                                <Input 
                                id="prenom" 
                                type="prenom" 
                                required
                                {...register("prenom", {
                                required: true,
                                })}
                                />
                                {errors.prenom && <span className="
                                mt-2 text-sm text-red-500
                                ">
                                Ce champ est obligatoire!
                                </span>}
                            </div>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <div className="grid gap-3 flex-1/2">
                                <Label htmlFor="email">E-mail<Required/></Label>
                                <Input 
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                {...register("email", {
                                    required: true,
                                    pattern: emailRegex
                                })}
                                />
                                {errors.email && <span className="
                                mt-2 text-sm text-red-500
                                ">
                                Champ requis! Veuillez saisir un email valid
                                </span>}
                            </div>
                            <div className="grid gap-3 flex-1/2">
                                <div className="flex items-center">
                                <Label htmlFor="password">Mot de passe<Required/></Label>
                                </div>
                                <Input 
                                id="password" 
                                type="password" 
                                required={!isEdit}
                                {...register("password", {
                                required: !isEdit,
                                pattern: mdpRegex,
                                min: 8
                                })}
                                />
                                {errors.password && <span className="
                                mt-2 text-sm text-red-500
                                ">
                                Champ requis! Minimum: 1 maj, 1 min, 1 chiffre, 1 spé, 8 car
                                </span>}
                            </div>
                        </div>
                        <div className="grid gap-3 mb-4">
                                <Label htmlFor="email">Rôle<Required/></Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    defaultValue={initialData?.role || ""}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Rôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="gerant">Gérant</SelectItem>
                                            <SelectItem value="comptable">Comptable</SelectItem>
                                        </SelectContent>
                                        </Select>
                                    )}
                                />    
                                {errors.role && <span className="
                                mt-2 text-sm text-red-500
                                ">
                                Champ obligatoire! Veuillez selectionner un rôle
                                </span>}
                        </div>
                        <div className="flex flex-col gap-3">
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

export default AjoutUserForm;
