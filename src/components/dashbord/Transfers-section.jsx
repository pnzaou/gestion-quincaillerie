"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export function TransfersSection({ orderId, shopId }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const res = await fetch(`/api/order/${orderId}/transfers`);
        const data = await res.json();
        
        if (res.ok) {
          setTransfers(data.transfers || []);
        }
      } catch (error) {
        console.error("Erreur chargement transferts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, [orderId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (transfers.length === 0) {
    return null; // Ne rien afficher si aucun transfert
  }

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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { label: "En attente", className: "bg-gray-100 text-gray-800" },
      validated: { label: "Validé", className: "bg-blue-100 text-blue-800" },
      received: { label: "Reçu", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Annulé", className: "bg-red-100 text-red-800" }
    };

    const variant = variants[status] || variants.pending;

    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  // Calculer le total transféré
  const totalTransferred = transfers.reduce((sum, transfer) => 
    sum + transfer.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 
    0
  );

  const totalAmount = transfers.reduce((sum, transfer) => sum + transfer.totalAmount, 0);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-orange-600" />
          Transferts effectués depuis cette commande
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Articles transférés</p>
              <p className="text-2xl font-bold text-orange-600">{totalTransferred} unités</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Montant total</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Boutique destination</TableHead>
              <TableHead className="text-center">Articles</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((transfer) => (
              <TableRow key={transfer._id}>
                <TableCell>
                  <Link 
                    href={`/shop/${shopId}/dashboard/transferts/${transfer._id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {transfer.reference}
                  </Link>
                </TableCell>
                <TableCell>
                  {transfer.destinationBusiness?.name || "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">
                    {transfer.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(transfer.totalAmount)}
                </TableCell>
                <TableCell className="text-center text-sm text-muted-foreground">
                  {formatDate(transfer.transferDate)}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(transfer.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Détails des produits transférés */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Détails des produits</h4>
          {transfers.map((transfer) => (
            <div key={transfer._id} className="mb-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-2">{transfer.reference}</p>
              <div className="space-y-1">
                {transfer.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{item.sourceProductId?.nom || "Produit"}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.transferPrice)}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.quantity * item.transferPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}