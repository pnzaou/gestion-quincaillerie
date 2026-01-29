"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import Required from "../Required";
import SaleStatus from "./Sale-status";
import PaymentMethod from "./Payment-method";
import { useSaleStore } from "@/stores/useSaleStore";
import { useQuoteStore } from "@/stores/useQuoteStore";
import { Separator } from "../ui/separator";
import { FileText, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

function DetailsVentePanier() {
  const loading = useSaleStore((state) => state.loading);
  const cart = useSaleStore((state) => state.cart);
  const saleDate = useSaleStore((state) => state.saleDate);
  const setSaleDate = useSaleStore((state) => state.setSaleDate);
  const discount = useSaleStore((state) => state.discount);
  const setDiscount = useSaleStore((state) => state.setDiscount);
  const saleStatus = useSaleStore((state) => state.saleStatus);
  const total = useSaleStore((state) => state.total());
  const createSale = useSaleStore((state) => state.createSale);
  const paymentsSum = useSaleStore((s) => s.paymentsSum());

  const quoteLoading = useQuoteStore((state) => state.loading);
  const createQuote = useQuoteStore((state) => state.createQuote);

  // ✅ Calcul du sous-total (avant remise)
  const subtotal = cart.reduce((sum, item) => {
    return sum + item.prixVente * item.quantity;
  }, 0);

  // ✅ État local pour basculer entre % et montant
  const [discountMode, setDiscountMode] = useState("percentage"); // "percentage" ou "amount"
  const [customAmount, setCustomAmount] = useState(subtotal);

  const remaining = total - paymentsSum;

  const handleCreateQuote = async () => {
    const state = useSaleStore.getState();
    
    if (!state.client) {
      toast.error("Veuillez sélectionner un client pour créer un devis");
      return;
    }
    
    await createQuote(state);
  };

  // ✅ Quand on change le montant personnalisé
  const handleCustomAmountChange = (value) => {
    const amount = parseFloat(value) || 0;
    
    if (amount < 0) return;
    if (amount > subtotal) {
      toast.error(`Le montant ne peut pas dépasser ${subtotal.toFixed(2)} FCFA`);
      return;
    }

    setCustomAmount(amount);
    
    // Calculer le % de remise correspondant
    const discountPercent = ((subtotal - amount) / subtotal) * 100;
    setDiscount(discountPercent);
  };

  // ✅ Quand on change le pourcentage
  const handleDiscountPercentChange = (value) => {
    const percent = parseFloat(value) || 0;
    
    if (percent < 0) return;
    if (percent > 100) return;

    setDiscount(percent);
    
    // Calculer le montant correspondant
    const amount = subtotal * (1 - percent / 100);
    setCustomAmount(amount);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Date de la vente</Label>
        <Popover modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !saleDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {saleDate ? format(saleDate, "PPP", { locale: fr }) : "Sélectionner une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={saleDate}
              onSelect={(date) => {
                setSaleDate(date);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* ✅ NOUVELLE SECTION REMISE AMÉLIORÉE */}
      <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Mode de remise</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setDiscountMode("percentage")}
              className={cn(
                "h-8 text-xs",
                discountMode === "percentage"
                  ? "bg-[#0084D1] hover:bg-[#0042d1] text-white"
                  : "bg-transparent hover:bg-muted text-foreground border"
              )}
            >
              % Remise
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setDiscountMode("amount")}
              className={cn(
                "h-8 text-xs",
                discountMode === "amount"
                  ? "bg-[#0084D1] hover:bg-[#0042d1] text-white"
                  : "bg-transparent hover:bg-muted text-foreground border"
              )}
            >
              Montant final
            </Button>
          </div>
        </div>

        {discountMode === "percentage" ? (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Pourcentage de remise</Label>
            <div className="relative">
              <Input
                type="number"
                value={discount}
                onChange={(e) => handleDiscountPercentChange(e.target.value)}
                min={0}
                step={0.01}
                max={100}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Montant final à payer</Label>
            <div className="relative">
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                min={0}
                step={1}
                max={subtotal}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                FCFA
              </span>
            </div>
          </div>
        )}

        {discount > 0 && (
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded">
            {discountMode === "percentage" 
              ? `Montant final: ${customAmount.toFixed(2)} FCFA`
              : `Remise appliquée: ${discount.toFixed(2)}%`
            }
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Statut <Required />
        </Label>
        <SaleStatus />
      </div>

      {(saleStatus === "paid" || saleStatus === "partial") && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Paiements <Required />
          </Label>
          <PaymentMethod />
          {saleStatus === "partial" && (
            <div className="mt-2 text-sm bg-yellow-50 text-yellow-800 p-2 rounded">
              Reste à payer : {remaining.toFixed(2)} FCFA
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* ✅ RÉCAPITULATIF DÉTAILLÉ */}
      <div className="bg-primary/10 p-3 sm:p-4 rounded-lg space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Sous-total</span>
          <span className={discount > 0 ? "line-through text-muted-foreground" : "font-medium"}>
            {subtotal.toFixed(2)} FCFA
          </span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between items-center text-sm text-green-600">
            <span>Remise ({discount.toFixed(2)}%)</span>
            <span>
              -{(subtotal - total).toFixed(2)} FCFA
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold text-base sm:text-lg">Total à payer</span>
          <span className="font-bold text-xl sm:text-2xl text-[#0084D1]">
            {total.toFixed(2)} FCFA
          </span>
        </div>
      </div>

      {/* Boutons - responsive */}
      <div className="space-y-2 sm:space-y-3">
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white py-5 sm:py-6 text-base sm:text-lg font-semibold gap-2"
          onClick={handleCreateQuote}
          disabled={quoteLoading || cart.length === 0}
        >
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          {quoteLoading ? "Création..." : "Créer un devis"}
        </Button>

        <Button
          className="w-full bg-[#0084D1] hover:bg-[#0042d1] text-white py-5 sm:py-6 text-base sm:text-lg font-semibold gap-2"
          onClick={createSale}
          disabled={loading}
        >
          <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
          {loading ? "Enregistrement..." : "Valider la vente"}
        </Button>
      </div>
    </div>
  );
}

export default DetailsVentePanier;