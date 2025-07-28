"use client";

import { format, parseISO } from "date-fns";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Required from "../Required";
import SaleStatus from "./Sale-status";
import PaymentMethod from "./Payment-method";
import { useSaleStore } from "@/stores/useSaleStore";

function DetailsVentePanier() {
  const loading = useSaleStore((state) => state.loading);
  const saleDate = useSaleStore((state) => state.saleDate);
  const setSaleDate = useSaleStore((state) => state.setSaleDate);
  const discount = useSaleStore((state) => state.discount);
  const setDiscount = useSaleStore((state) => state.setDiscount);
  const saleStatus = useSaleStore((state) => state.saleStatus);
  const total = useSaleStore((state) => state.total());
  const createSale = useSaleStore((state) => state.createSale);
  const amountPaid = useSaleStore((state) => state.amountPaid);
  const setAmountPaid = useSaleStore((state) => state.setAmountPaid);

  // formate la date pour l'afficher dans l'input YYYY-MM-DD
  const isoDate = saleDate ? format(saleDate, "yyyy-MM-dd") : "";

  return (
    <div className="space-y-4 w-[250px]">
      <div>
        <Label className="mb-3">Date de la vente</Label>
        <Input
          type="date"
          value={isoDate}
          onChange={(e) => {
            const val = e.target.value;
            // si l’utilisateur efface, on remet null
            if (!val) {
              setSaleDate(null);
              return;
            }
            // parse ISO string back en Date()
            const parsed = parseISO(val);
            setSaleDate(parsed);
          }}
          className="w-full"
        />
      </div>

      <div>
        <Label className="mb-3">Remise %</Label>
        <Input
          type="number"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          min={0}
          step={0.01}
          max={100}
        />
      </div>

      <div>
        <Label className="mb-3">
          Statut <Required />
        </Label>
        <SaleStatus />
      </div>

      {saleStatus === "partial" && (
        <div>
          <Label>
            Montant reçu <Required />
          </Label>
          <Input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(Number(e.target.value))}
            min={0}
            step={0.01}
            max={total}
          />
        </div>
      )}

      {(saleStatus === "paid" || saleStatus === "partial") && (
        <div>
          <Label className="mb-3">
            Mode de paiement <Required />
          </Label>
          <PaymentMethod />
        </div>
      )}

      <div className="font-semibold">Total : {total.toFixed(2)} fcfa</div>
      <button
        className="w-full bg-[#0084D1] hover:bg-[#0042d1] text-white py-2 rounded"
        onClick={createSale}
        disabled={loading}
      >
        {loading ? "Enregistrement..." : "Valider la vente"}
      </button>
    </div>
  );
}

export default DetailsVentePanier;
