"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
            {isEdit ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              {/* Ligne 1 - Nom et Prénom */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="nom">
                    Nom
                    <Required />
                  </Label>
                  <Input id="nom" type="text" {...register("nom")} />
                  {errors?.nom && (
                    <span className="text-xs text-red-500">
                      {errors?.nom.message}
                    </span>
                  )}
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="prenom">
                    Prénom
                    <Required />
                  </Label>
                  <Input id="prenom" type="text" {...register("prenom")} />
                  {errors?.prenom && (
                    <span className="text-xs text-red-500">
                      {errors?.prenom.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Ligne 2 - Email et Mot de passe */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="grid gap-2 flex-1">
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
                    <span className="text-xs text-red-500">
                      {errors?.email.message}
                    </span>
                  )}
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="password">
                    Mot de passe
                    <Required />
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required={!isEdit}
                    {...register("password")}
                  />
                  {errors.password && (
                    <span className="text-xs text-red-500">
                      {errors?.password.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Ligne 3 - Rôle */}
              <div className="grid gap-2">
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
                        <SelectValue placeholder="Sélectionner un rôle" />
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
                  <span className="text-xs text-red-500">
                    {errors?.role.message}
                  </span>
                )}
              </div>

              {/* Champ Boutique conditionnel */}
              {selectedRole === "gerant" && (
                <div className="grid gap-2">
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
                        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[460px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher une boutique..." />
                            <CommandEmpty>Aucune boutique trouvée.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-y-auto">
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
                    <span className="text-xs text-red-500">
                      {errors?.business.message}
                    </span>
                  )}
                </div>
              )}
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

export default AjoutUserForm;