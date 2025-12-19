"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

export const ProductPriceHistoryDialog = ({ open, onOpenChange, productId, businessId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/product/${productId}/price-history?businessId=${businessId}`);
        const data = await res.json();
        if (res.ok) {
          setHistory(data.history);
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [open, productId, businessId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  if (!open) return null;

  const latestPrice = history[0]?.unitPrice || 0;
  const previousPrice = history[1]?.unitPrice || latestPrice;
  const priceChange = latestPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? ((priceChange / previousPrice) * 100).toFixed(1) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Historique des prix d'achat
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Aucun historique disponible</div>
        ) : (
          <>
            <div className="mb-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prix d'achat actuel</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(latestPrice)}</p>
                </div>
                {history.length > 1 && priceChange !== 0 && (
                  <div className={`flex items-center gap-2 ${priceChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {priceChange > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <div className="text-right">
                      <p className="font-semibold">{priceChange > 0 ? '+' : ''}{formatCurrency(priceChange)}</p>
                      <p className="text-sm">({priceChange > 0 ? '+' : ''}{priceChangePercent}%)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(item.receivedDate)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.notes === "Stock initial" || item.notes === "Stock initial (migration)" 
                        ? "Stock initial" 
                        : "Commande"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};