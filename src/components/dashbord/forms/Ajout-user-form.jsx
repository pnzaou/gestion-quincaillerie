"use client";

import { useState, useEffect } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Required from "@/components/Required";
import { yupResolver } from "@hookform/resolvers/yup";
import { addUserSchema } from "@/schemas";

const AjoutUserForm = ({ className, initialData = null, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      nom: initialData?.nom || "",
      prenom: initialData?.prenom || "",
      email: initialData?.email || "",
      role: initialData?.role || "",
      business: initialData?.business || "",
    },
    resolver: yupResolver(addUserSchema(isEdit)),
  });

  const selectedRole = watch("role");

  // Récupérer les boutiques depuis la BD
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch("/api/business");
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data.businesses || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des boutiques:", error);
      }
    };

    if (selectedRole === "gerant") {
      fetchBusinesses();
    }
  }, [selectedRole]);

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
        router.push("/utilisateur/liste");
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
                <Label htmlFor="nom">
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
              <div className="grid gap-3 flex-1/2">
                <div className="flex items-center">
                  <Label htmlFor="prenom">
                    Prénom
                    <Required />
                  </Label>
                </div>
                <Input id="prenom" type="text" {...register("prenom")} />
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
              <Label htmlFor="role">
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

            {/* Champ Boutique conditionnel */}
            {selectedRole === "gerant" && (
              <div className="grid gap-3 mb-4">
                <Label htmlFor="business">
                  Boutique
                  <Required />
                </Label>
                <Controller
                  name="business"
                  control={control}
                  render={({ field }) => (
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className="w-full justify-between"
                        >
                          {field.value
                            ? businesses.find((b) => b._id === field.value)?.name
                            : "Sélectionner une boutique..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher une boutique..." />
                          <CommandEmpty>Aucune boutique trouvée.</CommandEmpty>
                          <CommandGroup>
                            {businesses.map((business) => (
                              <CommandItem
                                key={business._id}
                                value={business.name}
                                onSelect={() => {
                                  field.onChange(business._id);
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === business._id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {business.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors?.business && (
                  <span className="mt-2 text-xs text-red-500">
                    {errors?.business.message}
                  </span>
                )}
              </div>
            )}

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

export default AjoutUserForm;