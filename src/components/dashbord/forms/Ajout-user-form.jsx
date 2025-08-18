"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useForm, Controller } from "react-hook-form";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Required from "@/components/Required";
import { yupResolver } from "@hookform/resolvers/yup";
import { addUserSchema } from "@/schemas";

const AjoutUserForm = ({ className, initialData = null, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      nom: initialData?.nom || "",
      prenom: initialData?.prenom || "",
      email: initialData?.email || "",
      role: initialData?.role || "",
    },
    resolver: yupResolver(addUserSchema(isEdit)),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const url = isEdit
        ? `/api/user/${initialData._id}`
        : "/api/auth/register";
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
        toast.success(
          rep.message ||
            `Utilisateur ${isEdit ? "modifié" : "enregistré"} avec succès.`
        );
        router.push("/dashboard/utilisateur/liste");
      } else {
        toast.error(rep.message || "Erreur. Veuillez réessayer.");
      }
    } catch (error) {
      toast.error("Erreur. Veuillez réessayer.");
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
            {isEdit ? "Modifier l'utilisateur'" : "Ajouter un utilisateur"}
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
                <Input id="nom" type="nom" {...register("nom")} />
                {errors?.nom && (
                  <span className="mt-2 text-xs text-red-500">
                    {errors?.nom.message}
                  </span>
                )}
              </div>
              <div className="grid gap-3 flex-1/2">
                <div className="flex items-center">
                  <Label htmlFor="password">
                    Prénom
                    <Required />
                  </Label>
                </div>
                <Input
                  id="prenom"
                  type="prenom"
                  {...register("prenom")}
                />
                {errors?.prenom && (
                  <span className="mt-2 text-xs text-red-500">
                    {errors?.prenom.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="grid gap-3 flex-1/2">
                <Label htmlFor="email">
                  E-mail
                  <Required />
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors?.email && (
                  <span className="mt-2 text-xs text-red-500">
                    {errors?.email.message}
                  </span>
                )}
              </div>
              <div className="grid gap-3 flex-1/2">
                <div className="flex items-center">
                  <Label htmlFor="password">
                    Mot de passe
                    <Required />
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required={!isEdit}
                  {...register("password")}
                />
                {errors.password && (
                  <span className="mt-2 text-xs text-red-500">
                    {errors?.password.message}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-3 mb-4">
              <Label htmlFor="email">
                Rôle
                <Required />
              </Label>
              <Controller
                name="role"
                control={control}
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
              {errors?.role && (
                <span className="mt-2 text-xs text-red-500">
                  {errors?.role.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer"
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

export default AjoutUserForm;
