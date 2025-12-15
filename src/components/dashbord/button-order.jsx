"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import toast from "react-hot-toast";

export const DetailsOrder = ({ id }) => {
  const params = useParams();
  const shopId = params?.shopId;

  return (
    <Link href={`/shop/${shopId}/dashboard/commande/historique/${id}`}>
      <Button variant="ghost" size="icon">
        <Eye className="h-4 w-4" />
      </Button>
    </Link>
  );
};

export const CancelOrder = ({ id, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/order/${id}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        if (onCancel) onCancel();
        // Recharger la page pour mettre à jour la liste
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'annulation de la commande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          <XCircle className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annuler la commande</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir annuler cette commande ? Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Non, garder</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading ? "Annulation..." : "Oui, annuler"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};