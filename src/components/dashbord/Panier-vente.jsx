"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";
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
    <Sheet open={panierDrawerOpen} onOpenChange={setPanierDrawerOpen}>
      <SheetTrigger asChild>
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
      </SheetTrigger>

      <SheetContent 
        side="right" 
        className="w-full sm:max-w-full lg:max-w-7xl overflow-y-auto p-0"
      >
        <div className="p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">Récapitulatif de la vente</SheetTitle>
            <SheetDescription>
              {cart.length} article{cart.length > 1 ? "s" : ""} • Total: {useSaleStore.getState().total().toFixed(2)} FCFA
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Liste des articles - 4 colonnes */}
            <div className="lg:col-span-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-lg">Articles</h3>
                <ListeArticlesPanier
                  localStocks={localStocks}
                  setLocalStocks={setLocalStocks}
                />
              </div>
            </div>

            {/* 2. Détails de la vente - 5 colonnes */}
            <div className="lg:col-span-5">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-lg">Détails de la vente</h3>
                <DetailsVentePanier />
              </div>
            </div>

            {/* 3. Infos client - 3 colonnes */}
            <div className="lg:col-span-3">
              <div className="bg-muted/30 rounded-lg p-4">
                <InfosClientPanier />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PanierVente;