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
          <Button variant="outline" className="h-10 px-3 sm:px-4">
            <ShoppingCart className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Panier</span>
          </Button>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          )}
        </div>
      </SheetTrigger>

      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl lg:max-w-7xl overflow-y-auto p-0"
      >
        <div className="p-4 sm:p-6">
          <SheetHeader className="mb-4 sm:mb-6">
            <SheetTitle className="text-xl sm:text-2xl">Récapitulatif de la vente</SheetTitle>
            <SheetDescription className="text-sm">
              {cart.length} article{cart.length > 1 ? "s" : ""} • Total: {useSaleStore.getState().total().toFixed(2)} FCFA
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Articles - mobile: pleine largeur, desktop: 4 colonnes */}
            <div className="lg:col-span-4 order-1">
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Articles</h3>
                <ListeArticlesPanier
                  localStocks={localStocks}
                  setLocalStocks={setLocalStocks}
                />
              </div>
            </div>

            {/* Détails - mobile: 2ème, desktop: 5 colonnes */}
            <div className="lg:col-span-5 order-3 lg:order-2">
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Détails de la vente</h3>
                <DetailsVentePanier />
              </div>
            </div>

            {/* Infos client - mobile: 3ème, desktop: 3 colonnes */}
            <div className="lg:col-span-3 order-2 lg:order-3">
              <div className="bg-muted/30 rounded-lg p-3 sm:p-4">
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