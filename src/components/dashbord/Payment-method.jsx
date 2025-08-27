"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PAYMENT_METHODS } from "@/constants/paymentMethods";
import { useSaleStore } from "@/stores/useSaleStore";
import toast from "react-hot-toast";
import { Minus, Plus } from "lucide-react";

const PaymentMethod = () => {
  const payments = useSaleStore((s) => s.payments);
  const addPayment = useSaleStore((s) => s.addPayment);
  const removePayment = useSaleStore((s) => s.removePayment);
  const paymentsSum = useSaleStore((s) => s.paymentsSum());

  const client = useSaleStore((s) => s.client);

  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");

  function handleAdd() {
    const amt = Number(amount);
    if (!method) {
      toast.error("Veuillez choisir un mode de paiement.");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Montant invalide.");
      return;
    }
    if (method === "account" && !client) {
      toast.error("Sélectionner un client pour utiliser le Compte client.");
      return;
    }

    addPayment({ method, amount: amt });
    setMethod("");
    setAmount("");
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          value={method}
          onValueChange={(v) => setMethod(v)}
        >
          <SelectTrigger className="min-w-[40%]">
            <SelectValue placeholder="Mode de paiement" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Montant"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-[50%]"
          min={0}
        />

        <Button onClick={handleAdd} className="bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer">
          <Plus />
        </Button>
      </div>

      {/* Liste des paiements ajoutés */}
      <div>
        {payments.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Aucun paiement ajouté
          </div>
        )}
        {payments.map((p, idx) => {
          const label =
            PAYMENT_METHODS.find((m) => m.value === p.method)?.label ||
            p.method;
          return (
            <div
              key={idx}
              className="flex items-center justify-between border rounded px-2 py-1 mt-2"
            >
              <div>
                {label} — {Number(p.amount).toFixed(2)} FCFA
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removePayment(idx)}
                  aria-label={`Supprimer paiement ${idx}`}
                >
                  <Minus />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-sm font-medium">
        Somme paiements : {paymentsSum.toFixed(2)} FCFA
      </div>
    </div>
  );
};

export default PaymentMethod;
