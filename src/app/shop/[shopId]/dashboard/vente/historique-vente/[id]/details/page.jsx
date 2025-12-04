"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SaleStatusBadge } from "@/components/dashbord/Sale-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoicePrint } from "@/components/dashbord/Invoice-print";
import { ReceiptPrint } from "@/components/dashbord/Receipt-print";
import { InvoicePreview } from "@/components/dashbord/Invoice-preview";
import { ReceiptPreview } from "@/components/dashbord/Receipt-preview";
import {
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Package, 
  CreditCard,
  ShoppingBag,
  Receipt,
  DollarSign,
  Printer,
  FileText,
  ExternalLink
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { PaymentDialog } from "@/components/dashbord/Payment-dialog";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [sale, setSale] = useState(null);
  const [payments, setPayments] = useState([]);
  const [printMode, setPrintMode] = useState(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Fonction pour charger les données de la vente
  const fetchSale = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sale/${id}`, {
        cache: 'no-store' // Force le rechargement sans cache
      });
      const data = await res.json();
      
      if(!res.ok) {
        toast.error(data?.message || "Erreur lors de la récupération de la vente");
        return;
      }
      setSale(data?.sale);
      setPayments(data?.payments);
      
    } catch (error) {
      console.error("Error fetching sale:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSale();
  }, [fetchSale]);

  // Callback après paiement réussi
  const handlePaymentSuccess = () => {
    fetchSale(); // Recharger les données
  };

  const handlePrintInvoice = () => {
    setShowInvoicePreview(false);
    setPrintMode('invoice');
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 300);
  };

  const handlePrintReceipt = () => {
    setShowReceiptPreview(false);
    setPrintMode('receipt');
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Products Table Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payments Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-6">
              {/* Client Info Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-4 w-4 rounded-full mt-1" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Sale Info Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-4 w-4 rounded-full mt-1" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Vente non trouvée</CardTitle>
            <CardDescription>La vente que vous recherchez n'existe pas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/vente/historique-vente">
              <Button className="w-full bg-[#0084D1] text-white hover:bg-[#006BB3]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux ventes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const subtotal = sale?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <>
      {/* Contenu principal - caché lors de l'impression */}
      <div className={printMode ? "hidden" : "min-h-screen bg-background p-4 md:p-8"}>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {sale.reference}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Détails de la vente
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SaleStatusBadge status={sale.status} />
              {(sale.status === "pending" || sale.status === "partial") && (
                <Button
                  onClick={() => setShowPaymentDialog(true)}
                  className="gap-2 bg-[#0084D1] text-white hover:bg-[#006BB3]"
                >
                  <CreditCard className="w-4 h-4" />
                  Procéder au paiement
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowInvoicePreview(true)}
                className="gap-2 hover:bg-[#1CCA5B] hover:text-white hover:cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Facture
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReceiptPreview(true)}
                className="gap-2 hover:bg-[#1CCA5B] hover:text-white hover:cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Ticket
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Produits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <ShoppingBag className="w-5 h-5 text-[#0B64F3]" />
                    Produits vendus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-center">Quantité</TableHead>
                        <TableHead className="text-right">
                          Prix unitaire
                        </TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale?.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.product.nom}
                              </div>
                              {item.product.reference && (
                                <div className="text-xs text-muted-foreground">
                                  Réf: {item.product.reference}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{item.quantity}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Sous-total</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {sale.remise && sale.remise > 0 && (
                      <div className="flex justify-between text-[#1CCA5B]">
                        <span>Remise</span>
                        <span>- {formatCurrency(sale.remise)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#0B64F3]">
                        {formatCurrency(sale.total)}
                      </span>
                    </div>
                    {sale.amountDue && sale.amountDue > 0 && (
                      <div className="flex justify-between text-[#E19209] font-medium">
                        <span>Montant dû</span>
                        <span>{formatCurrency(sale.amountDue)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Paiements */}
              {payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CreditCard className="w-5 h-5 text-[#0B64F3]" />
                      Historique des paiements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <div
                          key={payment._id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              {formatCurrency(payment.amount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(payment.createdAt)}
                            </div>
                          </div>
                          <Badge variant="outline">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {payment.method === "account"
                              ? "Compte client"
                              : payment.method}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between font-medium">
                      <span>Total payé</span>
                      <span className="text-[#1CCA5B]">
                        {formatCurrency(totalPaid)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Informations client */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Client
                    </CardTitle>
                    {sale.client && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { router.push(`/dashboard/client/${sale.client._id}/details`) }}
                        className="gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Voir détails
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sale.client ? (
                    <>
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Nom complet
                          </div>
                          <div className="font-medium">
                            {sale.client.nomComplet}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Téléphone
                          </div>
                          <div className="font-medium">{sale.client.tel}</div>
                        </div>
                      </div>
                      {sale.client.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Email
                            </div>
                            <div className="font-medium">
                              {sale.client.email}
                            </div>
                          </div>
                        </div>
                      )}
                      {sale.client.adresse && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Adresse
                            </div>
                            <div className="font-medium">
                              {sale.client.adresse}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Client anonyme
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informations de vente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Receipt className="w-5 h-5 text-[#0B64F3]" />
                    Informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Date de vente
                      </div>
                      <div className="font-medium">
                        {formatDate(sale.dateExacte)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Vendeur
                      </div>
                      <div className="font-medium">{sale.vendeur.nom}</div>
                      <div className="text-xs text-muted-foreground">
                        {sale.vendeur.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Nombre d'articles
                      </div>
                      <div className="font-medium">
                        {sale.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        articles
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Composants d'impression - visibles uniquement lors de l'impression */}
      {printMode === "invoice" && (
        <InvoicePrint sale={sale} payments={payments} />
      )}
      {printMode === "receipt" && (
        <ReceiptPrint sale={sale} payments={payments} />
      )}

      {/* Aperçus avant impression */}
      <InvoicePreview
        open={showInvoicePreview}
        onOpenChange={setShowInvoicePreview}
        sale={sale}
        payments={payments}
        onPrint={handlePrintInvoice}
      />
      <ReceiptPreview
        open={showReceiptPreview}
        onOpenChange={setShowReceiptPreview}
        sale={sale}
        payments={payments}
        onPrint={handlePrintReceipt}
      />

      {/* Dialog de paiement */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        totalAmount={sale.total}
        amountDue={sale.amountDue || sale.total}
        saleReference={sale.reference}
        saleId={sale._id}
        hasClient={!!sale.client}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default Page;
