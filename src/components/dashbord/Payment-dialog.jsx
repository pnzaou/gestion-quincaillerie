"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export const PaymentDialog = ({
  open,
  onOpenChange,
  totalAmount,
  amountDue,
  saleReference,
  saleId,
  hasClient = false, // pour savoir si on peut utiliser "account"
  onPaymentSuccess,
}) => {
  const router = useRouter();
  const [paymentType, setPaymentType] = useState("paid");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setPaymentType("paid");
      setAmount(amountDue.toString());
      setPaymentMethod("");
    }
  }, [open, amountDue]);

  useEffect(() => {
    // Update amount when payment type changes
    if (paymentType === "paid") {
      setAmount(amountDue.toString());
    } else {
      setAmount("");
    }
  }, [paymentType, amountDue]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    
    if (!paymentMethod) {
      toast.error("Veuillez sélectionner un mode de paiement");
      return;
    }

    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (paymentAmount > amountDue) {
      toast.error("Le montant ne peut pas dépasser le montant dû");
      return;
    }

    if (paymentMethod === "account" && !hasClient) {
      toast.error("Aucun client associé à cette vente pour utiliser le compte client");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/sale/${saleId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentAmount,
          method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Erreur lors de l'enregistrement du paiement");
        return;
      }

      toast.success(data.message || "Paiement enregistré avec succès");
      onOpenChange(false);
      
      // Appeler le callback pour recharger les données
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      toast.error("Erreur lors de l'enregistrement du paiement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Procéder au paiement
          </DialogTitle>
          <DialogDescription>
            Vente {saleReference}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Montant dû */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Montant dû</span>
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(amountDue)}
              </span>
            </div>
          </div>

          {/* Type de paiement */}
          <div className="space-y-2">
            <Label htmlFor="payment-type">Type de paiement</Label>
            <Select value={paymentType} onValueChange={(value) => setPaymentType(value)}>
              <SelectTrigger id="payment-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paiement total</SelectItem>
                <SelectItem value="partial">Paiement partiel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Montant à payer */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant à payer</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min="0"
                max={amountDue}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={paymentType === "paid"}
                className="pl-10"
                placeholder="Entrez le montant"
              />
            </div>
            {paymentType === "partial" && (
              <p className="text-xs text-muted-foreground">
                Maximum: {formatCurrency(amountDue)}
              </p>
            )}
          </div>

          {/* Mode de paiement */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Mode de paiement</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Sélectionnez un mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="espèce">Espèces</SelectItem>
                <SelectItem value="carte de crédit">Carte de crédit</SelectItem>
                <SelectItem value="Wave">Wave</SelectItem>
                <SelectItem value="Orange Money">Orange Money</SelectItem>
                <SelectItem value="Free Money">Free Money</SelectItem>
                {hasClient && (
                  <SelectItem value="account">Compte client</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-[#0084D1] text-white hover:bg-[#006BB3]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Valider le paiement"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};