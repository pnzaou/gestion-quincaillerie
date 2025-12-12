"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
} from "lucide-react";

import { useSaleStore } from "@/stores/useSaleStore";
import { Button } from "../ui/button";
import InfosClientPanier from "./infos-client-panier";
import DetailsVentePanier from "./details-vente-panier";
import ListeArticlesPanier from "./liste-articles-panier";

const PanierVente = ({ localStocks, setLocalStocks }) => {
  
  const panierDrawerOpen = useSaleStore((state) => state.panierDrawerOpen);
  const setPanierDrawerOpen = useSaleStore((state) => state.setPanierDrawerOpen);
  const cart = useSaleStore((state) => state.cart);
  
  return (
    <Dialog open={panierDrawerOpen} onOpenChange={setPanierDrawerOpen}>
      <DialogTrigger asChild>
        <div className="relative inline-block">
          <Button variant="outline" className="px-4 py-2">
            <ShoppingCart className="mr-1 h-4 w-4" /> Panier
          </Button>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="min-w-6xl">
        <DialogHeader>
          <DialogTitle>
            <p className="text-lg font-bold mb-4">Récapitulatif de la vente</p>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row md:justify-between">
          {/* 1. Liste des articles */}
          <div>
            <ListeArticlesPanier
              localStocks={localStocks}
              setLocalStocks={setLocalStocks}
            />
          </div>

          {/* 2. Détails de la vente */}
          <div className="md:w-80 lg:w-96">
            <DetailsVentePanier />
          </div>

          {/* 3. Infos client */}
          <div className="md:w-64">
            <InfosClientPanier />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PanierVente;
