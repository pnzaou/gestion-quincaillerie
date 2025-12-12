import React from "react";

import { Plus, Minus } from "lucide-react";
import { useSaleStore } from "@/stores/useSaleStore";
import { Button } from "../ui/button";

const ListeArticlesPanier = ({ localStocks, setLocalStocks }) => {
  const addToCart = useSaleStore((state) => state.addToCart);
  const removeFromCart = useSaleStore((state) => state.removeFromCart);
  const cart = useSaleStore((state) => state.cart);

  return (
    <div className="space-y-3 max-h-[360px] w-full md:w-72 overflow-y-auto mb-4">
      {cart.length === 0 && (
        <div className="text-sm text-muted-foreground">Panier vide</div>
      )}
      {cart.map((item) => (
        <div
          key={item._id}
          className="flex justify-between items-center py-2 border-b last:border-b-0"
        >
          <div className="flex-1 pr-4">
            <div className="font-medium truncate">{item.nom}</div>
            <div className="text-xs text-gray-500">
              {(item.prixVenteDetail || item.prixVenteEnGros) + " fcfa"}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeFromCart(item._id, setLocalStocks)}
              className="border rounded-full w-9 h-9"
            >
              <Minus />
            </Button>
            <div className="w-6 text-center">{item.quantity}</div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => addToCart(item, localStocks, setLocalStocks)}
              className="border rounded-full w-9 h-9"
            >
              <Plus />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListeArticlesPanier;
