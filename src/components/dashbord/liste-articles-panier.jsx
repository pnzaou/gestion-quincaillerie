import React from "react";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useSaleStore } from "@/stores/useSaleStore";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ListeArticlesPanier = ({ localStocks, setLocalStocks }) => {
  const addToCart = useSaleStore((state) => state.addToCart);
  const removeFromCart = useSaleStore((state) => state.removeFromCart);
  const cart = useSaleStore((state) => state.cart);

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {cart.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Panier vide</p>
          </div>
        )}
        {cart.map((item) => (
          <div
            key={item._id}
            className="flex justify-between items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
          >
            <div className="flex-1 pr-4 min-w-0">
              <div className="font-medium truncate">{item.nom}</div>
              <div className="text-sm text-muted-foreground">
                {(item.prixVenteDetail || item.prixVenteEnGros)} FCFA
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeFromCart(item._id, setLocalStocks)}
                className="border rounded-full w-8 h-8 hover:bg-red-50"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-8 text-center font-semibold">{item.quantity}</div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => addToCart(item, localStocks, setLocalStocks)}
                className="border rounded-full w-8 h-8 hover:bg-green-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ListeArticlesPanier;