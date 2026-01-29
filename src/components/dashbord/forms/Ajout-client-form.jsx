"use client";

import Required from "@/components/Required";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { addClientSchema } from "@/schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const AjoutClientForm = ({ className, initialData = null, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const shopId = params?.shopId;
  const isEdit = Boolean(initialData);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      nomComplet: initialData?.nomComplet || "",
      tel: initialData?.tel || "",
      email: initialData?.email || "",
      adresse: initialData?.adresse || "",
    },
    resolver: yupResolver(addClientSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const url = isEdit ? `/api/client/${initialData._id}` : "/api/client";
      const method = isEdit ? "PUT" : "POST";

      const payload = isEdit ? data : { ...data, businessId: shopId };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const rep = await response.json();

      if (response.ok) {
        toast.success(rep.message);
        router.push(`/shop/${shopId}/dashboard/clients/liste`);
      } else {
        toast.error(rep.message);
      }
    } catch (error) {
      toast.error(
        `Erreur lors de ${
          isEdit ? "la modification" : "l'ajout"
        } du client. Veuillez réessayer.`
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Modifier le client" : "Ajouter un client"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              {/* Ligne 1 - responsive */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="grid gap-3 flex-1">
                  <Label>
                    Nom complet
                    <Required />
                  </Label>
                  <Input {...register("nomComplet")} />
                  {errors?.nomComplet && (
                    <p className="text-xs text-red-500">
                      {errors?.nomComplet.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-3 flex-1">
                  <Label>
                    Téléphone
                    <Required />
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+221 7X XXX XXXX"
                    {...register("tel")}
                  />
                  {errors?.tel && (
                    <p className="text-xs text-red-500">
                      {errors?.tel.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Ligne 2 - responsive */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="grid gap-3 flex-1">
                  <Label>Email</Label>
                  <Input type="email" {...register("email")} />
                  {errors?.email && (
                    <p className="text-xs text-red-500">
                      {errors?.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-3 flex-1">
                  <Label>Adresse</Label>
                  <Input {...register("adresse")} />
                  {errors?.adresse && (
                    <p className="text-xs text-red-500">
                      {errors?.adresse.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bouton submit */}
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                    <span className="ml-2">
                      {isEdit ? "Mise à jour..." : "Enregistrement..."}
                    </span>
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

export default AjoutClientForm;