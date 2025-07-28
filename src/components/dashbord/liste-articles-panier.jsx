import React from "react";

import { Plus, Minus } from "lucide-react";
import { useSaleStore } from "@/stores/useSaleStore";
import { Button } from "../ui/button";

const ListeArticlesPanier = ({ localStocks, setLocalStocks }) => {
  const addToCart = useSaleStore((state) => state.addToCart);
  const removeFromCart = useSaleStore((state) => state.removeFromCart);
  const cart = useSaleStore((state) => state.cart);

  return (
    <div className="space-y-2 max-h-[298px] w-[300px] overflow-y-auto mb-4">
      {cart.map((item) => (
        <div key={item._id} className="flex justify-between items-center">
          <div className="">{item.nom}</div>
          <div className="flex items-center space-x-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeFromCart(item._id, setLocalStocks)}
              className="border rounded-full w-8 h-8 text-red-600 hover:bg-red-100 hover:cursor-pointer"
            >
              <Minus />
            </Button>
            <div>{item.quantity}</div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => addToCart(item, localStocks, setLocalStocks)}
              className="border rounded-full w-8 h-8 text-red-600 hover:bg-red-100 hover:cursor-pointer"
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
