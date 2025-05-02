"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useRouter } from "next/navigation";
import { Label } from "../ui/label";
import toast from "react-hot-toast";

const AjoutCatForm = ({className, ...props}) => {
    const [isLoading, setIsLoading] = useState(false)
    const { register, handleSubmit, formState: { errors }, setValue } = useForm()
    const router = useRouter()

    const onSubmit = async (data) => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/category", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const rep = await response.json()

            if (response.ok) {
                setIsLoading(false)
                setValue("nom", "")
                setValue("description", "")
                router.push("/dashboard/categorie/liste")
                toast.success(rep.message);
            } else {
                setIsLoading(false)
                toast.error(rep.message);
            }
        } catch (error) {
            setIsLoading(false)
            toast.error("Erreur lors de l'ajout de l'utilisateur. Veuillez réessayer.");
            console.error(error);
        }
    }

    
    return (
        ( <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Ajouter une catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex gap-2 mb-4">
                            <div className="grid gap-3 flex-1/2">
                                <Label htmlFor="email">Nom</Label>
                                <Input 
                                id="nom"
                                type="text"
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
                        </div>
                        <div className="flex gap-2 mb-4">
                            <div className="grid gap-3 flex-1/2">
                                <div className="flex items-center">
                                    <Label htmlFor="description">Description</Label>
                                </div>
                                <Textarea
                                    id="description" 
                                    {...register("description")}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button type="submit" className="w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer" disabled={isLoading}>
                            {isLoading 
                            ? (
                                <>
                                <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span> Enregistrement en cours...
                                </>
                            ) 
                            : "Enregistrer"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>)
    );
}

export default AjoutCatForm;
