"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Receipt } from "lucide-react";
import { useState } from "react";
import { InvoicePreview } from "./Invoice-preview";
import { ReceiptPreview } from "./Receipt-preview";

export const SalePreviewDialog = ({ open, onOpenChange, sale, payments, onPrintModeChange }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  if (!sale) return null;

  const handleInvoiceClick = () => {
    onOpenChange(false);
    setShowInvoice(true);
  };

  const handleReceiptClick = () => {
    onOpenChange(false);
    setShowReceipt(true);
  };

  // ✅ MODIFIÉ - Utiliser onPrintModeChange
  const handleInvoicePrint = () => {
    setShowInvoice(false);
    onPrintModeChange('invoice'); // ✅ Activer le mode impression
    setTimeout(() => {
      window.print();
      onPrintModeChange(null); // ✅ Désactiver après impression
    }, 300);
  };

  const handleReceiptPrint = () => {
    setShowReceipt(false);
    onPrintModeChange('receipt'); // ✅ Activer le mode impression
    setTimeout(() => {
      window.print();
      onPrintModeChange(null); // ✅ Désactiver après impression
    }, 300);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Vente enregistrée avec succès !
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <p className="text-center text-muted-foreground mb-6">
              Que souhaitez-vous imprimer ?
            </p>

            <Button
              onClick={handleInvoiceClick}
              className="w-full h-16 text-lg gap-3 bg-[#0084D1] hover:bg-[#006BB3]"
            >
              <FileText className="w-6 h-6" />
              Facture
            </Button>

            <Button
              onClick={handleReceiptClick}
              variant="outline"
              className="w-full h-16 text-lg gap-3 hover:bg-[#1CCA5B] hover:text-white"
            >
              <Receipt className="w-6 h-6" />
              Ticket
            </Button>

            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="w-full mt-4"
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Previews pour impression */}
      <InvoicePreview
        open={showInvoice}
        onOpenChange={setShowInvoice}
        sale={sale}
        payments={payments}
        onPrint={handleInvoicePrint}
      />
      
      <ReceiptPreview
        open={showReceipt}
        onOpenChange={setShowReceipt}
        sale={sale}
        payments={payments}
        onPrint={handleReceiptPrint}
      />
    </>
  );
};