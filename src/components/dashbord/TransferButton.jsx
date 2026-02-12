"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function TransferButton({ order, businesses, currentBusinessId }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [selectedItems, setSelectedItems] = useState({});
  const [notes, setNotes] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");

  const handleItemQuantityChange = (productId, quantity) => {
    const qty = parseFloat(quantity) || 0;
    const roundedQty = Math.round(qty * 100) / 100;
    
    setSelectedItems(prev => {
      if (roundedQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: roundedQty };
    });
  };

  const handleTransfer = async () => {
    if (!selectedBusiness) {
      toast.error("Veuillez sélectionner une boutique destination");
      return;
    }

    const items = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => {
        const orderItem = order.items.find(i => i.product._id === productId);
        return {
          productId,
          quantity,
          transferPrice: orderItem.actualPrice || orderItem.estimatedPrice,
          notes: ""
        };
      });

    if (items.length === 0) {
      toast.error("Veuillez sélectionner au moins un article");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceBusiness: currentBusinessId,
          destinationBusiness: selectedBusiness,
          items,
          sourceOrder: order._id,
          reason: "order_split",
          expectedArrival: expectedArrival || null,
          notes
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Transfert créé avec succès");
        setDialogOpen(false);
        window.location.reload(); // Recharger pour voir le stock mis à jour
      } else {
        toast.error(data.message || "Erreur lors du transfert");
      }
    } catch (error) {
      console.error("Erreur transfert:", error);
      toast.error("Erreur lors du transfert");
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les boutiques (exclure la boutique actuelle)
  const availableBusinesses = businesses.filter(b => b._id !== currentBusinessId);

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <ArrowRightLeft className="w-4 h-4" />
        Transférer
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transférer des articles</DialogTitle>
            <DialogDescription>
              Sélectionnez la boutique destination et les articles à transférer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Boutique destination */}
            <div>
              <Label>Boutique destination</Label>
              <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une boutique" />
                </SelectTrigger>
                <SelectContent>
                  {availableBusinesses.map(business => (
                    <SelectItem key={business._id} value={business._id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Articles */}
            <div>
              <Label>Articles à transférer</Label>
              <div className="space-y-3 mt-2">
                {order.items.map(item => (
                  <div key={item.product._id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.product.nom}</div>
                      <div className="text-sm text-muted-foreground">
                        Reçu: {item.receivedQuantity} / Prix: {(item.actualPrice || item.estimatedPrice).toFixed(2)} FCFA
                      </div>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        max={item.receivedQuantity}
                        step="0.5"
                        value={selectedItems[item.product._id] || ""}
                        onChange={(e) => handleItemQuantityChange(item.product._id, e.target.value)}
                        placeholder="Qté"
                        className="text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date d'arrivée prévue */}
            <div>
              <Label>Date d'arrivée prévue (optionnel)</Label>
              <Input
                type="date"
                value={expectedArrival}
                onChange={(e) => setExpectedArrival(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <Label>Notes (optionnel)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informations complémentaires..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleTransfer} disabled={loading} className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer le transfert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}