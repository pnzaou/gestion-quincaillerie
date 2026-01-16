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

  const remaining = total - paymentsSum;

  const handleCreateQuote = async () => {
    const state = useSaleStore.getState();
    
    if (!state.client) {
      toast.error("Veuillez sélectionner un client pour créer un devis");
      return;
    }
    
    await createQuote(state);
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

      <div className="space-y-2">
        <Label className="text-sm font-medium">Remise %</Label>
        <Input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          min={0}
          step={0.01}
          max={100}
        />
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

      <div className="bg-primary/10 p-3 sm:p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-base sm:text-lg">Total</span>
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