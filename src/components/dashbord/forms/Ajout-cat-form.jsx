"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useRouter } from "next/navigation";
import { Label } from "../../ui/label";
import toast from "react-hot-toast";
import EIBCat from "../ExelImportButtons/EIBCat";
import Required from "@/components/Required";
import { yupResolver } from "@hookform/resolvers/yup";
import { addCategorySchema } from "@/schemas";

const AjoutCatForm = ({ className, initialData = null, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      nom: initialData?.nom || "",
      description: initialData?.description || "",
    },
    resolver: yupResolver(addCategorySchema),
  });

  const isEdit = Boolean(initialData);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const url = isEdit ? `/api/category/${initialData._id}` : "/api/category";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const rep = await response.json();

      if (response.ok) {
        router.push("/dashboard/categorie/liste");
        toast.success(rep.message);
      } else {
        toast.error(rep.message);
      }
    } catch (error) {
      toast.error(
        "Erreur lors de l'ajout de l'utilisateur. Veuillez réessayer."
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {!isEdit && <EIBCat />}
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Modifier la catégorie" : "Ajouter une catégorie"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex gap-2 mb-4">
              <div className="grid gap-3 flex-1/2">
                <Label htmlFor="email">
                  Nom
                  <Required />
                </Label>
                <Input id="nom" type="text" {...register("nom")} />
                {errors?.nom && (
                  <span className="mt-2 text-xs text-red-500">
                    {errors?.nom.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="grid gap-3 flex-1/2">
                <div className="flex items-center">
                  <Label htmlFor="description">Description</Label>
                </div>
                <Textarea id="description" {...register("description")} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>{" "}
                    {isEdit ? "Mise à jour..." : "Enregistrement..."}
                  </>
                ) : isEdit ? (
                  "Mettre à jour"
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AjoutCatForm;
