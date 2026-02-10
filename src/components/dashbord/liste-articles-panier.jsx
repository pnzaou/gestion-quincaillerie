import React from "react";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useSaleStore } from "@/stores/useSaleStore";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";

const ListeArticlesPanier = ({ localStocks, setLocalStocks }) => {
  const addToCart = useSaleStore((state) => state.addToCart);
  const removeFromCart = useSaleStore((state) => state.removeFromCart);
  const updateCartQuantity = useSaleStore((state) => state.updateCartQuantity);
  const cart = useSaleStore((state) => state.cart);

  // ✅ Gestion de la saisie directe de quantité
  const handleQuantityChange = (item, newQuantity) => {
    const qty = parseInt(newQuantity) || 0;

    const roundedQty = Math.round(qty * 100) / 100;

    const maxStock = localStocks[item._id] ?? item.QteStock;
    const currentCartQty = item.quantity || 0;
    
    // Quantité disponible = stock actuel + quantité déjà dans le panier
    const availableStock = maxStock + currentCartQty;

    if (roundedQty < 0) return;
    
    const newStock = availableStock - roundedQty;
    if (newStock < 0) {
      toast.warning(`⚠️ Stock négatif : ${newStock.toFixed(2)}`, { duration: 2000 });
    }

    updateCartQuantity(item, roundedQty, localStocks, setLocalStocks);
  };

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
                {item.prixVente} FCFA
              </div>
            </div>
            
            {/* ✅ Contrôles de quantité avec input */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeFromCart(item._id, setLocalStocks)}
                className="border rounded-full w-8 h-8 hover:bg-red-50 flex-shrink-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                type="number"
                min="0"
                step="0.5"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item, e.target.value)}
                className="text-center h-8 w-14 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => addToCart(item, localStocks, setLocalStocks)}
                className="border rounded-full w-8 h-8 hover:bg-green-50 flex-shrink-0"
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