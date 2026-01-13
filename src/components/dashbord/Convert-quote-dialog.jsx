"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

const PAYMENT_METHODS = [
  { value: "espèce", label: "Espèce" },
  { value: "carte", label: "Carte bancaire" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "virement", label: "Virement" },
  { value: "chèque", label: "Chèque" },
  { value: "account", label: "Compte client" },
];

export const ConvertQuoteDialog = ({ open, onOpenChange, quote, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saleStatus, setSaleStatus] = useState("pending");
  const [payments, setPayments] = useState([]);

  if (!quote) return null;

  const total = quote.total;
  const paymentsSum = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const remaining = total - paymentsSum;
  const hasAccountPayment = payments.some(p => p.method === "account");

  const addPayment = () => {
    setPayments([...payments, { method: "espèce", amount: 0 }]);
  };

  const updatePayment = (index, field, value) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setPayments(newPayments);
  };

  const removePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    // Validation
    if (!saleStatus) {
      toast.error("Veuillez sélectionner un statut de vente");
      return;
    }

    if (saleStatus === "paid" && paymentsSum !== total) {
      toast.error("Pour une vente payée, la somme des paiements doit être égale au total");
      return;
    }

    if (saleStatus === "partial" && (paymentsSum <= 0 || paymentsSum >= total)) {
      toast.error("Pour un paiement partiel, le montant doit être entre 0 et le total");
      return;
    }

    if (saleStatus === "pending" && paymentsSum > 0) {
      toast.error("Pour une vente en attente, aucun paiement ne doit être enregistré");
      return;
    }

    if ((saleStatus === "partial" || saleStatus === "pending") && !quote.client) {
      toast.error("Un client est requis pour les ventes partielles ou en attente");
      return;
    }

    if (hasAccountPayment && !quote.client) {
      toast.error("Un client est requis pour les paiements via compte client");
      return;
    }

    for (const p of payments) {
      if (!p.method) {
        toast.error("Veuillez sélectionner une méthode de paiement");
        return;
      }
      if (!p.amount || p.amount <= 0) {
        toast.error("Tous les montants doivent être supérieurs à 0");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quote/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: quote._id,
          status: saleStatus,
          payments: payments.filter(p => p.amount > 0),
        }),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success("Devis converti en vente avec succès");
        onOpenChange(false);
        onSuccess?.(result.data);
      } else {
        const error = await res.json();
        toast.error(error.message || "Erreur lors de la conversion");
      }
    } catch (error) {
      console.error("Erreur conversion:", error);
      toast.error("Erreur lors de la conversion");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setSaleStatus(newStatus);
    
    // Réinitialiser paiements selon le statut
    if (newStatus === "pending") {
      setPayments([]);
    } else if (newStatus === "paid" && payments.length === 0) {
      setPayments([{ method: "espèce", amount: total }]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convertir le devis en vente</DialogTitle>
          <DialogDescription>
            Devis {quote.reference} - {quote.client?.nomComplet || "Client non renseigné"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé devis */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Résumé du devis</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Articles:</span>
                <span>{quote.items.length}</span>
              </div>
              {quote.remise > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Remise:</span>
                  <span>{quote.remise}%</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-base">
                <span>Total:</span>
                <span className="text-[#0084D1]">{total.toFixed(2)} FCFA</span>
              </div>
            </div>
          </div>

          {/* Statut de la vente */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Statut de la vente <span className="text-red-500">*</span>
            </Label>
            <Select value={saleStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="partial">Paiement partiel</SelectItem>
                <SelectItem value="pending">En attente de paiement</SelectItem>
              </SelectContent>
            </Select>
            
            {saleStatus === "pending" && (
              <p className="text-xs text-amber-600">
                ℹ️ Aucun paiement ne sera enregistré pour ce statut
              </p>
            )}
          </div>

          {/* Paiements */}
          {saleStatus !== "pending" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Paiements <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addPayment}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>

              {payments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun paiement enregistré. Cliquez sur "Ajouter" pour commencer.
                </p>
              )}

              {payments.map((payment, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Méthode</Label>
                    <Select
                      value={payment.method}
                      onValueChange={(value) => updatePayment(index, "method", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Montant (FCFA)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={payment.amount || ""}
                      onChange={(e) => updatePayment(index, "amount", Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removePayment(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Totaux paiements */}
              {payments.length > 0 && (
                <div className="bg-muted/50 p-3 rounded space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total des paiements:</span>
                    <span className="font-semibold">{paymentsSum.toFixed(2)} FCFA</span>
                  </div>
                  {remaining !== 0 && (
                    <div className={`flex justify-between text-sm ${remaining > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                      <span>{remaining > 0 ? 'Reste à payer:' : 'Trop perçu:'}</span>
                      <span className="font-semibold">{Math.abs(remaining).toFixed(2)} FCFA</span>
                    </div>
                  )}
                </div>
              )}

              {/* Avertissements */}
              {hasAccountPayment && !quote.client && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-800">
                  ⚠️ Un client est requis pour les paiements via compte client
                </div>
              )}

              {saleStatus === "paid" && paymentsSum !== total && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                  ⚠️ Pour une vente payée, le total des paiements doit être égal au montant total
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConvert}
              className="flex-1 bg-[#0084D1] hover:bg-[#006BB3]"
              disabled={loading}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? "Conversion..." : "Valider la vente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};