"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import OrderStatusBadge from "@/components/dashbord/Order-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  FileText,
  Printer,
  CheckCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderPrint } from "@/components/dashbord/Order-print";
import { OrderPreview } from "@/components/dashbord/Order-preview";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const shopId = params?.shopId;

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [receivingItems, setReceivingItems] = useState({});
  const [actualPrices, setActualPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [printMode, setPrintMode] = useState(null);
  const [showOrderPreview, setShowOrderPreview] = useState(false);

  // Fonction pour charger les données de la commande
  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/order/${id}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Erreur lors de la récupération de la commande");
        return;
      }
      setOrder(data?.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleToggleItem = (productId, checked) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, productId]);
      // Initialiser la quantité à recevoir avec la quantité restante
      const item = order.items.find((i) => i.product._id === productId);
      if (item) {
        setReceivingItems((prev) => ({
          ...prev,
          [productId]: item.quantity - item.receivedQuantity,
        }));

        setActualPrices((prev) => ({
          ...prev,
          [productId]: item.estimatedPrice,
        }));
      }
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== productId));
      setReceivingItems((prev) => {
        const newItems = { ...prev };
        delete newItems[productId];
        return newItems;
      });
      setActualPrices((prev) => {
        const newPrices = { ...prev };
        delete newPrices[productId];
        return newPrices;
      });
    }
  };

  const handleQuantityChange = (productId, value) => {
    const item = order.items.find((i) => i.product._id === productId);
    const maxQuantity = item.quantity - item.receivedQuantity;
    const qty = Math.max(0, Math.min(parseInt(value) || 0, maxQuantity));

    setReceivingItems((prev) => ({
      ...prev,
      [productId]: qty,
    }));
  };

  const handleReceiveOrder = async () => {
    if (selectedItems.length === 0) {
      toast.error("Veuillez sélectionner au moins un produit");
      return;
    }

    // Vérifier que toutes les quantités sont valides
    const items = selectedItems.map((productId) => ({
      productId,
      receivedQuantity: receivingItems[productId] || 0,
      actualPrice: actualPrices[productId] || 0,
    }));

    if (items.some((item) => item.receivedQuantity <= 0)) {
      toast.error("Toutes les quantités doivent être supérieures à 0");
      return;
    }

    if (items.some((item) => item.actualPrice <= 0)) {
      toast.error("Tous les prix doivent être supérieurs à 0");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/order/${id}/receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setReceiveDialogOpen(false);
        setSelectedItems([]);
        setReceivingItems({});
        fetchOrder(); // Recharger la commande
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error receiving order:", error);
      toast.error("Erreur lors de la réception");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/order/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        fetchOrder();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handlePrintOrder = () => {
    setShowOrderPreview(false);
    setPrintMode("order");
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Commande non trouvée</CardTitle>
            <CardDescription>
              La commande que vous recherchez n'existe pas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/shop/${shopId}/dashboard/commande/historique`}>
              <Button className="w-full bg-[#0084D1] text-white hover:bg-[#006BB3]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux commandes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const canReceive =
    order.status !== "completed" &&
    order.status !== "cancelled" &&
    order.items.some((item) => item.receivedQuantity < item.quantity);

  const pendingItems = order.items.filter(
    (item) => item.receivedQuantity < item.quantity
  );

  return (
    <>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() =>
                  router.push(`/shop/${shopId}/dashboard/commande/historique`)
                }
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {order.reference}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Détails de la commande
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <OrderStatusBadge status={order.status} />

              {order.status === "draft" && (
                <Button
                  onClick={() => handleUpdateStatus("sent")}
                  className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Marquer comme envoyée
                </Button>
              )}

              {order.status === "sent" && (
                <Button
                  onClick={() => handleUpdateStatus("confirmed")}
                  className="gap-2 bg-yellow-600 text-white hover:bg-yellow-700"
                >
                  Marquer comme confirmée
                </Button>
              )}

              {canReceive && (
                <Button
                  onClick={() => setReceiveDialogOpen(true)}
                  className="gap-2 bg-[#10B981] text-white hover:bg-[#059669]"
                >
                  <CheckCircle className="w-4 h-4" />
                  Recevoir la commande
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowOrderPreview(true)}
                className="gap-2 hover:bg-[#1CCA5B] hover:text-white"
              >
                <Printer className="w-4 h-4" />
                Bon de commande
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
                    <Package className="w-5 h-5 text-[#0B64F3]" />
                    Produits commandés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-center">Commandé</TableHead>
                        <TableHead className="text-center">Reçu</TableHead>
                        <TableHead className="text-right">P.U.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order?.items?.map((item, index) => (
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
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                item.receivedQuantity === item.quantity
                                  ? "default"
                                  : item.receivedQuantity > 0
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {item.receivedQuantity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              order.status === "completed" && item.actualPrice
                                ? item.actualPrice
                                : item.estimatedPrice
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(
                              order.status === "completed" && item.actualPrice
                                ? item.actualPrice * item.quantity
                                : item.estimatedPrice * item.quantity
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.status === "received" ? (
                              <Badge className="bg-green-100 text-green-800">
                                Reçu
                              </Badge>
                            ) : item.status === "partially_received" ? (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Partiel
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                En attente
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    {/* Total estimé */}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Total Estimé</span>
                      <span>{formatCurrency(order.estimatedTotal)}</span>
                    </div>

                    {/* Total réel (si commande completed) */}
                    {order.status === "completed" && order.actualTotal > 0 && (
                      <>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Réel</span>
                          <span className="text-[#0B64F3]">
                            {formatCurrency(order.actualTotal)}
                          </span>
                        </div>

                        {/* Écart de prix */}
                        {order.priceVariance !== 0 && (
                          <div
                            className={`flex justify-between text-sm font-medium ${
                              order.priceVariance > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            <span>Écart de prix</span>
                            <span>
                              {order.priceVariance > 0 ? "+" : ""}
                              {formatCurrency(order.priceVariance)}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Si pas completed ou actualTotal = 0, afficher l'estimé comme total */}
                    {(order.status !== "completed" ||
                      order.actualTotal === 0) && (
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-[#0B64F3]">
                          {formatCurrency(order.estimatedTotal)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Informations fournisseur */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Fournisseur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.supplier ? (
                    <>
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Nom
                          </div>
                          <div className="font-medium">
                            {order.supplier.nom}
                          </div>
                        </div>
                      </div>
                      {order.supplier.tel && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Téléphone
                            </div>
                            <div className="font-medium">
                              {order.supplier.tel}
                            </div>
                          </div>
                        </div>
                      )}
                      {order.supplier.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Email
                            </div>
                            <div className="font-medium">
                              {order.supplier.email}
                            </div>
                          </div>
                        </div>
                      )}
                      {order.supplier.adresse && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Adresse
                            </div>
                            <div className="font-medium">
                              {order.supplier.adresse}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucun fournisseur spécifié
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informations de commande */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <FileText className="w-5 h-5 text-[#0B64F3]" />
                    Informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Date de commande
                      </div>
                      <div className="font-medium">
                        {formatDate(order.orderDate)}
                      </div>
                    </div>
                  </div>
                  {order.expectedDelivery && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Livraison attendue
                        </div>
                        <div className="font-medium">
                          {formatDate(order.expectedDelivery)}
                        </div>
                      </div>
                    </div>
                  )}
                  {order.receivedDate && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Date de réception
                        </div>
                        <div className="font-medium">
                          {formatDate(order.receivedDate)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Créée par
                      </div>
                      <div className="font-medium">
                        {order.createdBy.nom} {order.createdBy.prenom}
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
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        articles
                      </div>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="pt-2 border-t">
                      <div className="text-sm text-muted-foreground mb-1">
                        Notes
                      </div>
                      <div className="text-sm">{order.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de réception */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recevoir la commande</DialogTitle>
            <DialogDescription>
              Sélectionnez les produits reçus et indiquez les quantités
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {pendingItems.map((item) => {
              const remaining = item.quantity - item.receivedQuantity;
              const isSelected = selectedItems.includes(item.product._id);

              return (
                <div
                  key={item.product._id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleToggleItem(item.product._id, checked)
                    }
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.product.nom}</div>
                    <div className="text-sm text-muted-foreground">
                      Restant à recevoir: {remaining} sur {item.quantity}
                    </div>
                    {isSelected && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <Label htmlFor={`qty-${item.product._id}`}>
                            Quantité reçue
                          </Label>
                          <Input
                            id={`qty-${item.product._id}`}
                            type="number"
                            min="1"
                            max={remaining}
                            value={receivingItems[item.product._id] || ""}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.product._id,
                                e.target.value
                              )
                            }
                            className="w-full"
                          />
                        </div>

                        {/* ✅ Nouveau champ pour le prix réel */}
                        <div>
                          <Label htmlFor={`price-${item.product._id}`}>
                            Prix réel unitaire (FCFA)
                            <span className="text-xs text-muted-foreground ml-2">
                              (Estimé: {item.estimatedPrice.toFixed(2)})
                            </span>
                          </Label>
                          <Input
                            id={`price-${item.product._id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={actualPrices[item.product._id] || ""}
                            onChange={(e) =>
                              setActualPrices((prev) => ({
                                ...prev,
                                [item.product._id]:
                                  parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReceiveDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleReceiveOrder}
              disabled={loading || selectedItems.length === 0}
              className="bg-[#10B981] hover:bg-[#059669]"
            >
              {loading ? "Réception..." : "Valider la réception"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Composant d'impression - visible uniquement lors de l'impression */}
      {printMode === "order" && <OrderPrint order={order} />}

      {/* Aperçu avant impression */}
      <OrderPreview
        open={showOrderPreview}
        onOpenChange={setShowOrderPreview}
        order={order}
        onPrint={handlePrintOrder}
      />
    </>
  );
};

export default Page;