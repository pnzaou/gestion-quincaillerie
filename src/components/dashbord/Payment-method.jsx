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
      {/* Formulaire ajout paiement - toujours empilé verticalement */}
      <div className="space-y-2">
        <Select
          value={method}
          onValueChange={(v) => setMethod(v)}
        >
          <SelectTrigger className="w-full">
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

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Montant"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1"
            min={0}
          />

          <Button 
            onClick={handleAdd} 
            className="bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer flex-shrink-0"
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="space-y-2 mt-3">
        {payments.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-2">
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
              className="flex items-center justify-between border rounded px-3 py-2 bg-white"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-sm font-medium truncate">{label}</div>
                <div className="text-xs text-muted-foreground">
                  {Number(p.amount).toFixed(2)} FCFA
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removePayment(idx)}
                className="h-8 w-8 hover:bg-red-50 flex-shrink-0"
                aria-label={`Supprimer paiement ${idx}`}
              >
                <Minus className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="text-sm font-semibold pt-2 border-t space-y-1">
        <div className="flex justify-between">
          <span>Somme paiements :</span>
          <span>{paymentsSum.toFixed(2)} FCFA</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Total vente :</span>
          <span>{useSaleStore.getState().total().toFixed(2)} FCFA</span>
        </div>
        {paymentsSum !== useSaleStore.getState().total() && (
          <div className="flex justify-between text-yellow-600 text-xs">
            <span>Différence :</span>
            <span>{(useSaleStore.getState().total() - paymentsSum).toFixed(2)} FCFA</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethod;