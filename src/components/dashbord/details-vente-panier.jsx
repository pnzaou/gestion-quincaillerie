"use client";

import { format, parseISO } from "date-fns";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Required from "../Required";
import SaleStatus from "./Sale-status";
import PaymentMethod from "./Payment-method";
import { useSaleStore } from "@/stores/useSaleStore";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

function DetailsVentePanier() {
  const loading = useSaleStore((state) => state.loading);
  const saleDate = useSaleStore((state) => state.saleDate);
  const setSaleDate = useSaleStore((state) => state.setSaleDate);
  const discount = useSaleStore((state) => state.discount);
  const setDiscount = useSaleStore((state) => state.setDiscount);
  const saleStatus = useSaleStore((state) => state.saleStatus);
  const total = useSaleStore((state) => state.total());
  const createSale = useSaleStore((state) => state.createSale);
  const paymentsSum = useSaleStore((s) => s.paymentsSum());

  const remaining = total - paymentsSum;

  // formate la date pour l'afficher dans l'input YYYY-MM-DD
  const isoDate = saleDate ? format(saleDate, "yyyy-MM-dd") : "";

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Date de la vente</Label>
        <Input
          type="date"
          value={isoDate}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              setSaleDate(null);
              return;
            }
            const parsed = parseISO(val);
            setSaleDate(parsed);
          }}
          className="w-full"
        />
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

      <div className="bg-primary/10 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">Total</span>
          <span className="font-bold text-2xl text-[#0084D1]">
            {total.toFixed(2)} FCFA
          </span>
        </div>
      </div>

      <Button
        className="w-full bg-[#0084D1] hover:bg-[#0042d1] text-white py-6 text-lg font-semibold"
        onClick={createSale}
        disabled={loading}
      >
        {loading ? "Enregistrement..." : "Valider la vente"}
      </Button>
    </div>
  );
}

export default DetailsVentePanier;