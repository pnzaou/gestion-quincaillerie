"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import FormCombox from "../Form-combox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Required from "@/components/Required";
import toast from "react-hot-toast";
import { toBase64 } from "@/utils/convImgToBase64";
import EIBArt from "../ExelImportButtons/EIBArt";

const AjoutArticleForm = ({className, cats, fours, initialData = null, ...props}) => {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, control, formState: { errors }, setValue, getValues, trigger } = useForm();

    const isEdit = Boolean(initialData)

    const onSubmit = async (formData) => {
        setIsLoading(true)
        try {
            const data = {...formData}

            if(formData.image?.[0]){
                data.image = await toBase64(formData.image[0]);
            }

            const rep = await fetch('/api/product', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const res = await rep.json()
            if (rep.ok) {
                // router.push("")
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajout de l'article. Veuillez réessayer.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const nextStep = async () => {
        const valid = await trigger();
        if (valid) setStep((prev) => prev + 1);
    };
    
    const prevStep = () => setStep((prev) => prev - 1);

    return (
        (<div className={cn("flex flex-col gap-6", className)} {...props}>
            {!isEdit && <EIBArt/>}
             <Card>
                <CardHeader>
                    <CardTitle>{isEdit ? "Modifier l'article" : "Ajouter un article"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/f">
                        {/* Etape 1 */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="grid gap-3 flex-1">
                                        <Label>Nom<Required/></Label>
                                        <Input {...register("nom", { required: true })}/>
                                        {errors.nom && <p className="text-sm text-red-500">Ce champ est requis</p>}
                                    </div>
                                    <div className="grid gap-3 flex-1">
                                        <Label>Catégorie<Required/></Label>
                                        <Controller
                                            control={control}
                                            name="category_id"
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <FormCombox
                                                  value={field.value}
                                                  onChange={field.onChange}
                                                  options={cats.map((cat) => ({ value: cat._id, label: cat.nom }))}
                                                  placeholder="Sélectionner une catégorie"
                                                />
                                            )}
                                        />
                                        {errors.category_id && <p className="text-sm text-red-500">Ce champ est requis</p>}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="grid gap-3 flex-1">
                                        <Label>Prix Achat (Gros)<Required/></Label>
                                        <Input type="number" step="0.01" min="1" {...register("prixAchatEnGros", { required: true })} />
                                        {errors.prixAchatEnGros && <p className="text-sm text-red-500">Ce champ est requis</p>}
                                    </div>
                                    <div className="grid gap-3 flex-1">
                                        <Label>Prix Vente (Gros)<Required/></Label>
                                        <Input type="number" step="0.01" min="1" {...register("prixVenteEnGros", { required: true })} />
                                        {errors.prixVenteEnGros && <p className="text-sm text-red-500">Ce champ est requis</p>}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="grid gap-3 flex-1">
                                        <Label>Prix Achat (Gros)</Label>
                                        <Input type="number" step="0.01" min="1" {...register("prixAchatDetail")} />
                                    </div>
                                    <div className="grid gap-3 flex-1">
                                        <Label>Prix Vente (Gros)</Label>
                                        <Input type="number" step="0.01" min="1" {...register("prixVenteDetail")} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Etape 2 */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="grid gap-3 flex-1">
                                        <Label>Fournisseur<Required/></Label>
                                        <Controller
                                            control={control}
                                            name="supplier_id"
                                            rules={{ required: false }}
                                            render={({ field }) => (
                                                <FormCombox
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={fours.map((four) => ({ value: four._id, label: four.nom }))}
                                                    placeholder="Sélectionner un fournisseur"
                                                />
                                            )}
                                        />
                                        {errors.supplier_id && <p className="text-sm text-red-500">Ce champ est requis</p>}
                                    </div>
                                    <div className="grid gap-3 flex-1">
                                        <Label>Quantité Initiale<Required/></Label>
                                        <Input type="number" min="1" {...register("QteInitial", { required: true })} />
                                        {errors.QteInitial && <p className="text-sm text-red-500">Ce champ est requis</p>}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="grid gap-3 flex-1">
                                        <Label>Quantité en Stock<Required/></Label>
                                        <Input type="number" min="1" {...register("QteStock", { required: true })} />
                                        {errors.QteStock && <p className="text-sm text-red-500">Ce champ est requis</p>}
                                    </div>
                                    <div className="grid gap-3 flex-1">
                                        <Label>Quantité d'Alerte<Required/></Label>
                                        <Input type="number" min="1" {...register("QteAlerte", { required: true })} />
                                        {errors.QteAlerte && <p className="text-sm text-red-500">Ce champ est requis</p>}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="grid gap-3 flex-1">
                                        <Label>Référence</Label>
                                        <Input {...register("reference")} />
                                    </div>
                                    <div className="grid gap-3 flex-1">
                                        <Label>Date d'expiration</Label>
                                        <Input type="date" {...register("dateExpiration")} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Etape 3 */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="flex gap-2 mb-4">
                                    <div className="grid gap-3 flex-1/2">
                                        <Label htmlFor="image">Image</Label>
                                        <Input id="image" type="file" accept="image/*" {...register("image")}/>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <div className="grid gap-3 flex-1/2">
                                        <div className="flex items-center">
                                            <Label htmlFor="description">Description</Label>
                                        </div>
                                        <Textarea id="description" {...register("description")}/>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            {step > 1 && (
                                <Button type="button" variant="outline" onClick={prevStep} className="hover:cursor-pointer">
                                    Précédent
                                </Button>
                            )}
                            {step < 3 ? (
                                <Button type="button" onClick={nextStep} className="bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer">
                                    Continuer
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isLoading} className="bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer">
                                {isLoading 
                                ? (
                                    <>
                                        <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span> Enregistrement...
                                    </>
                                ) 
                                : (
                                    "Enregistrer"
                                )}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
             </Card>
        </div>)
    );
}

export default AjoutArticleForm;
