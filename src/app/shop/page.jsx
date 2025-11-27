"use client"

import { useEffect, useState } from "react";
import { Plus, Store, Phone, Mail, MapPin, Globe, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createShopSchema } from "@/schemas";
import { BusinessCardSkeletonGrid } from "@/components/skeletons";

const Page = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      website: "",
    },
    mode: "onChange",
    resolver: yupResolver(createShopSchema),
  })

  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const rep = await fetch("/api/shop");
        const repData = await rep.json();

        if (!rep.ok) {
          toast.error(
            repData?.message ||
              "Erreur lors de la récupération des boutiques. Veuillez réessayer."
          );
          return;
        }

        if (rep.ok) {
          setBusinesses(repData?.data || []);
        }
      } catch (error) {
        toast.error(
          "Erreur lors de la récupération des boutiques. Veuillez réessayer."
        );
        console.error(error);
        return;
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const onSubmit = async (data) => {

    if (
      !data.name?.trim() ||
      !data.phone?.trim() ||
      !data.email?.trim()
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const url = editingId ? `/api/shop/${editingId}` : "/api/shop";
    const method = editingId ? "PUT" : "POST";

    try {
      const rep = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const repData = await rep.json();

      if (!rep.ok) {
        toast.error(
          repData?.message ||
            "Erreur lors de l’enregistrement."
        );
        return;
      }

      if (editingId) {
        setBusinesses((prev) =>
          prev.map((b) => (b._id === editingId ? repData.data : b))
        );
        toast.success("Boutique modifiée avec succès.");
      } else {
        setBusinesses((prev) => [...prev, repData.data]);
        toast.success("Boutique créée avec succès.");
      }

      reset();
      setOpen(false);
      setEditingId(null);
    } catch (error) {
      toast.error(
        "Erreur lors de la création de la boutique. Veuillez réessayer."
      );
      return;
    }
  };

  const handleEdit = (business) => {
    setEditingId(business._id);
    setOpen(true);
    const { name = "", phone = "", email = "", address = "", website = "" } = business;
    reset({ name, phone, email, address, website });
  };

  const handleDelete = async () => {
    if (deletingId) {
      const businessToDelete = businesses.find((b) => b._id === deletingId);
      setBusinesses(prev => prev.filter(b => b._id !== deletingId))
      try {
        const rep = await fetch(`/api/shop/${deletingId}`, {
          method: "DELETE",
        });

        const repData = await rep.json();

        if (!rep.ok) {
          setBusinesses(prev => [...prev, businessToDelete]);
          toast.error(
            repData?.message ||
              "Erreur lors de la suppression de la boutique. Veuillez réessayer."
          );
          return;
        }
      } catch (error) {
        setBusinesses(prev => [...prev, businessToDelete]);
        toast.error(
          "Erreur lors de la suppression de la boutique. Veuillez réessayer."
        );
        return;
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEditingId(null);
    }
  };

  const handleBusinessSelect = (businessId) => {
    router.push(`/dashboard/${businessId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1166D4]/10 mb-4">
            <Store className="w-8 h-8 text-[#1166D4]" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Mes Boutiques</h1>
          <p className="text-muted-foreground text-lg">
            Sélectionnez une boutique pour accéder au tableau de bord
          </p>
        </div>

        {/* Bouton Créer une boutique */}
        <div className="flex justify-center mb-8">
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 bg-sky-600 hover:bg-sky-700 shadow-md hover:shadow-lg transition-all hover:cursor-pointer">
                <Plus className="w-5 h-5" />
                Nouvelle Boutique
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Modifier la boutique" : "Créer une nouvelle boutique"}
                </DialogTitle>
                <DialogDescription>
                  Renseignez les informations de votre boutique. Les champs marqués d'un * sont obligatoires.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ma Boutique"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Téléphone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+221 77 111 11 11"
                    {...register("phone")}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    placeholder="contact@boutique.com"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="Votre adresse"
                    {...register("address")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site Web</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.boutique.com"
                    {...register("website")}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website?.message}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700">
                    {editingId ? "Modifier" : "Créer la boutique"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Chargement */}
        {isLoading && <BusinessCardSkeletonGrid />}

        {/* Liste des boutiques */}
        {!isLoading && (businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card
                key={business._id}
                className="transition-all hover:shadow-lg group relative"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#1166D4]/10 group-hover:bg-[#1166D4]/20 transition-colors">
                      <Store className="w-6 h-6 text-[#1166D4]" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(business);
                        }}
                        className="h-8 w-8"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(business._id);
                        }}
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle
                    className="text-xl group-hover:text-[#1166D4] transition-colors cursor-pointer"
                    onClick={() => handleBusinessSelect(business._id)}
                  >
                    {business.name}
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3 cursor-pointer"
                  onClick={() => handleBusinessSelect(business._id)}
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{business.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{business.email}</span>
                  </div>
                  {business.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{business.address}</span>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{business.website}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Aucune boutique pour le moment
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Créez votre première boutique pour commencer à gérer votre stock et vos ventes.
            </p>
          </div>
        ))}

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. La boutique et toutes ses données seront définitivement supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Page;
