"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrderStore } from "@/stores/useOrderStore";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const PanierCommande = () => {
  const router = useRouter();
  const params = useParams();
  const shopId = params?.shopId;

  const [open, setOpen] = useState(false);
  
  const cart = useOrderStore((state) => state.cart);
  const removeFromCart = useOrderStore((state) => state.removeFromCart);
  const clearCart = useOrderStore((state) => state.clearCart);
  const supplier = useOrderStore((state) => state.supplier);
  const notes = useOrderStore((state) => state.notes);
  const setNotes = useOrderStore((state) => state.setNotes);
  const expectedDelivery = useOrderStore((state) => state.expectedDelivery);
  const setExpectedDelivery = useOrderStore((state) => state.setExpectedDelivery);
  const createOrder = useOrderStore((state) => state.createOrder);
  const loading = useOrderStore((state) => state.loading);
  const total = useOrderStore((state) => state.total);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateOrder = async () => {
    const success = await createOrder();
    if (success) {
      setOpen(false);
      router.push(`/shop/${shopId}/dashboard/commande/historique`);
    }
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalQuantity > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {totalQuantity}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <div className="p-6 space-y-6">
          <SheetHeader>
            <SheetTitle>Panier de commande</SheetTitle>
            <SheetDescription>
              {cart.length} article{cart.length > 1 ? "s" : ""} dans le panier
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Fournisseur */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fournisseur</Label>
              {supplier ? (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="font-medium">{supplier.nom}</p>
                  {supplier.tel && (
                    <p className="text-sm text-muted-foreground">Tél: {supplier.tel}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
                  Aucun fournisseur sélectionné
                </p>
              )}
            </div>

            {/* Date de livraison attendue */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date de livraison attendue (optionnel)</Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expectedDelivery && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {expectedDelivery ? (
                      format(expectedDelivery, "PPP", { locale: fr })
                    ) : (
                      <span>Choisir une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={expectedDelivery}
                    onSelect={setExpectedDelivery}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Liste des articles */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Articles commandés</Label>
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Le panier est vide</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.nom}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.prixAchat)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold whitespace-nowrap">
                          {formatCurrency(item.prixAchat * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Retirer complètement l'article
                            for (let i = 0; i < item.quantity; i++) {
                              removeFromCart(item._id);
                            }
                          }}
                          className="h-8 w-8 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (optionnel)
              </Label>
              <Textarea
                id="notes"
                placeholder="Ajouter des notes sur la commande..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <Separator />

            {/* Total */}
            <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#0084D1]">{formatCurrency(total())}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => clearCart()}
                disabled={cart.length === 0}
                className="flex-1"
              >
                Vider
              </Button>
              <Button
                onClick={handleCreateOrder}
                disabled={cart.length === 0 || loading}
                className="flex-1 bg-[#0084D1] hover:bg-[#006BB3]"
              >
                {loading ? "Création..." : "Créer"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PanierCommande;