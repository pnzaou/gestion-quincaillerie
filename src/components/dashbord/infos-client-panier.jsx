"use client";

import { useSaleStore } from "@/stores/useSaleStore";
import { Trash, Pencil, UserPlus } from "lucide-react";
import { Button } from "../ui/button";

const InfosClientPanier = () => {
  const setSelectClientOpen = useSaleStore(
    (state) => state.setSelectClientOpen
  );
  const client = useSaleStore((state) => state.client);
  const handleDeleteSelectedClient = useSaleStore(
    (state) => state.handleDeleteSelectedClient
  );
  const handleUpdateNewClient = useSaleStore(
    (state) => state.handleUpdateNewClient
  );
  const setPanierDrawerOpen = useSaleStore(
    (state) => state.setPanierDrawerOpen
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-black font-semibold">Infos client</h2>
        <div className="flex items-center gap-2">
          {client ? (
            <>
              {!client?._id && (
                <Button
                  title="Modifie les infos client."
                  size="icon"
                  variant="ghost"
                  onClick={handleUpdateNewClient}
                  className="border rounded-full w-8 h-8"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              <Button
                title="Supprimer le client sélectionné."
                size="icon"
                variant="ghost"
                onClick={handleDeleteSelectedClient}
                className="border rounded-full w-8 h-8"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              title="Sélectionner/Ajouter un client."
              size="icon"
              variant="ghost"
              onClick={() => {
                setPanierDrawerOpen(false);
                setSelectClientOpen(true);
              }}
              className="border rounded-full w-8 h-8"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div>
        <p className="text-gray-500 text-sm mb-1">Nom Complet:</p>
        <p
          className={`font-semibold ${
            client?.nomComplet ? "text-black" : "text-gray-400 italic"
          }`}
        >
          {client?.nomComplet || "Nom non renseignée"}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm mb-1">Téléphone:</p>
        <p
          className={`font-semibold ${
            client?.tel ? "text-black" : "text-gray-400 italic"
          }`}
        >
          {client?.tel || "Numéro non renseignée"}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm mb-1">Email:</p>
        <p
          className={`font-semibold ${
            client?.email ? "text-black" : "text-gray-400 italic"
          }`}
        >
          {client?.email || "Email non renseigné"}
        </p>
      </div>

      <div>
        <p className="text-gray-500 text-sm mb-1">Adresse:</p>
        <p
          className={`font-semibold ${
            client?.adresse ? "text-black" : "text-gray-400 italic"
          }`}
        >
          {client?.adresse || "Adresse non renseignée"}
        </p>
      </div>
    </div>
  );
};

export default InfosClientPanier;
