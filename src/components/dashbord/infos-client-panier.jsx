"use client";

import { useSaleStore } from "@/stores/useSaleStore";
import { Trash, Pencil, UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

const InfosClientPanier = () => {
  const setSelectClientOpen = useSaleStore((state) => state.setSelectClientOpen);
  const client = useSaleStore((state) => state.client);
  const handleDeleteSelectedClient = useSaleStore((state) => state.handleDeleteSelectedClient);
  const handleUpdateNewClient = useSaleStore((state) => state.handleUpdateNewClient);
  const setPanierDrawerOpen = useSaleStore((state) => state.setPanierDrawerOpen);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Client</h3>
        <div className="flex items-center gap-1">
          {client ? (
            <>
              {!client?._id && (
                <Button
                  title="Modifier les infos client"
                  size="icon"
                  variant="ghost"
                  onClick={handleUpdateNewClient}
                  className="h-8 w-8 hover:bg-blue-50"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              <Button
                title="Supprimer le client sélectionné"
                size="icon"
                variant="ghost"
                onClick={handleDeleteSelectedClient}
                className="h-8 w-8 hover:bg-red-50"
              >
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </>
          ) : (
            <Button
              title="Sélectionner/Ajouter un client"
              size="icon"
              variant="ghost"
              onClick={() => {
                setPanierDrawerOpen(false);
                setSelectClientOpen(true);
              }}
              className="h-8 w-8 hover:bg-green-50"
            >
              <UserPlus className="w-4 h-4 text-green-600" />
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Nom Complet</p>
          <p className={`font-medium ${client?.nomComplet ? "text-foreground" : "text-muted-foreground italic"}`}>
            {client?.nomComplet || "Non renseigné"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Téléphone</p>
          <p className={`font-medium ${client?.tel ? "text-foreground" : "text-muted-foreground italic"}`}>
            {client?.tel || "Non renseigné"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Email</p>
          <p className={`font-medium ${client?.email ? "text-foreground" : "text-muted-foreground italic"}`}>
            {client?.email || "Non renseigné"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Adresse</p>
          <p className={`font-medium ${client?.adresse ? "text-foreground" : "text-muted-foreground italic"}`}>
            {client?.adresse || "Non renseigné"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfosClientPanier;