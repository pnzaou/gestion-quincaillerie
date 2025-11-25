"use client"

import { useState } from "react";
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

const Page = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    website: "",
  });
  const [errors, setErrors] = useState({});

  // Mock data - sera remplacé par les vraies données de la DB
  const [businesses, setBusinesses] = useState([
    {
      id: "1",
      name: "Boutique Centre-Ville",
      phone: "+33 1 23 45 67 89",
      email: "centre@example.com",
      address: "15 Rue de la Paix, Paris",
      website: "https://boutique-centre.fr",
    },
  ]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Validation
      const validated = businessSchema.parse(formData);
      
      if (editingId) {
        // Mode édition
        setBusinesses((prev) =>
          prev.map((b) =>
            b.id === editingId
              ? {
                  ...b,
                  name: validated.name,
                  phone: validated.phone,
                  email: validated.email,
                  address: validated.address || undefined,
                  website: validated.website || undefined,
                }
              : b
          )
        );
        
        toast.success(`${validated.name} a été modifiée avec succès.`);
      } else {
        // Mode création
        const newBusiness = {
          id: Date.now().toString(),
          name: validated.name,
          phone: validated.phone,
          email: validated.email,
          address: validated.address || undefined,
          website: validated.website || undefined,
        };
        
        setBusinesses((prev) => [...prev, newBusiness]);
        
        toast.success(`${validated.name} a été créée avec succès.`);
        
        // Navigation vers le dashboard uniquement en mode création
        router.push(`/dashboard/${newBusiness.id}`);
      }
      
      // Réinitialiser le formulaire
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        website: "",
      });
      setErrors({});
      setEditingId(null);
      setOpen(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleEdit = (business) => {
    setEditingId(business.id);
    setFormData({
      name: business.name,
      phone: business.phone,
      email: business.email,
      address: business.address || "",
      website: business.website || "",
    });
    setOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      const business = businesses.find((b) => b.id === deletingId);
      setBusinesses((prev) => prev.filter((b) => b.id !== deletingId));
      
      toast.success(`${business?.name} a été supprimée avec succès.`);
      
      setDeletingId(null);
    }
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEditingId(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        website: "",
      });
      setErrors({});
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ma Boutique"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Téléphone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contact@boutique.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="15 Rue de la Paix, Paris"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site Web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://www.boutique.com"
                    className={errors.website ? "border-destructive" : ""}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website}</p>
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

        {/* Liste des boutiques */}
        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card
                key={business.id}
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
                          setDeletingId(business.id);
                        }}
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle
                    className="text-xl group-hover:text-[#1166D4] transition-colors cursor-pointer"
                    onClick={() => handleBusinessSelect(business.id)}
                  >
                    {business.name}
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3 cursor-pointer"
                  onClick={() => handleBusinessSelect(business.id)}
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <Store className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Aucune boutique pour le moment
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Créez votre première boutique pour commencer à gérer votre stock et vos ventes.
            </p>
          </div>
        )}

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
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
