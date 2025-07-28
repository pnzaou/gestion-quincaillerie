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
      <div className="flex space-x-5">
        <div>
          <h2 className="text-black font-semibold">Infos client</h2>
        </div>
        {client ? (
          <div className="flex space-x-5">
            {!client?._id && (
              <div>
                <Button
                  title="Modifie les infos client."
                  size="icon"
                  variant="ghost"
                  onClick={handleUpdateNewClient}
                  className="border rounded-full w-6 h-6 text-green-600 hover:bg-green-100 hover:cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div>
              <Button
                title="Supprimer le client sélectionné."
                size="icon"
                variant="ghost"
                onClick={handleDeleteSelectedClient}
                className="border rounded-full w-6 h-6 text-green-600 hover:bg-green-100 hover:cursor-pointer"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex space-x-5">
            <div>
              <Button
                title="Sélectionner/Ajouter un client."
                size="icon"
                variant="ghost"
                onClick={() => {
                  setPanierDrawerOpen(false);
                  setSelectClientOpen(true);
                }}
                className="border rounded-full w-6 h-6 text-green-600 hover:bg-green-100 hover:cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
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
