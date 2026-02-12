"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  // ✅ Fonction pour obtenir le badge de source
  const getSourceBadge = (item) => {
    if (item.isOutgoing || item.source === 'transfer_out') {
      return (
        <Badge className="bg-orange-100 text-orange-800 gap-1">
          <ArrowRightLeft className="w-3 h-3" />
          Transfert sortant
        </Badge>
      );
    }
    
    if (item.source === 'transfer') {
      return <Badge className="bg-blue-100 text-blue-800">Transfert entrant</Badge>;
    }
    
    if (item.notes?.includes("Stock initial") || item.notes?.includes("migration")) {
      return <Badge className="bg-gray-100 text-gray-800">Stock initial</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">Commande</Badge>;
  };

  if (!open) return null;

  // ✅ Calculer le prix actuel (dernière entrée, pas sortie)
  const latestPurchase = history.find(h => !h.isOutgoing && h.source !== 'transfer_out');
  const latestPrice = latestPurchase?.unitPrice || 0;
  
  const previousPurchases = history.filter(h => !h.isOutgoing && h.source !== 'transfer_out');
  const previousPrice = previousPurchases[1]?.unitPrice || latestPrice;
  
  const priceChange = latestPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? ((priceChange / previousPrice) * 100).toFixed(1) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Historique des mouvements d'achat
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
                {previousPurchases.length > 1 && priceChange !== 0 && (
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
                  <TableHead>Type</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item, index) => {
                  const isOutgoing = item.isOutgoing || item.source === 'transfer_out';
                  
                  return (
                    <TableRow key={index} className={isOutgoing ? 'bg-orange-50' : ''}>
                      <TableCell>{formatDate(item.receivedDate)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Math.abs(item.unitPrice))}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${isOutgoing ? 'text-orange-600' : ''}`}>
                        {isOutgoing && '-'}{Math.abs(item.quantity)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${isOutgoing ? 'text-orange-600' : ''}`}>
                        {isOutgoing && '-'}{formatCurrency(Math.abs(item.totalCost))}
                      </TableCell>
                      <TableCell>
                        {getSourceBadge(item)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {item.notes || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};