"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import fr from "date-fns/locale/fr";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Minus,
  ShoppingCart,
  CalendarIcon,
  Trash,
  Pencil,
  UserPlus,
} from "lucide-react";

import { useSaleStore } from "@/stores/useSaleStore";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import Required from "../Required";
import SaleStatus from "./Sale-status";
import PaymentMethod from "./Payment-method";

const PanierVente = () => {
  const loading = useSaleStore((state) => state.loading);
  const saleDate = useSaleStore((state) => state.saleDate);
  const setSaleDate = useSaleStore((state) => state.setSaleDate);
  const panierDrawerOpen = useSaleStore((state) => state.panierDrawerOpen);
  const setPanierDrawerOpen = useSaleStore(
    (state) => state.setPanierDrawerOpen
  );
  const cart = useSaleStore((state) => state.cart);
  const addToCart = useSaleStore((state) => state.addToCart);
  const removeFromCart = useSaleStore((state) => state.removeFromCart);
  const discount = useSaleStore((state) => state.discount);
  const setDiscount = useSaleStore((state) => state.setDiscount);
  const saleStatus = useSaleStore((state) => state.saleStatus);
  const total = useSaleStore((state) => state.total());
  const createSale = useSaleStore((state) => state.createSale);
  const client = useSaleStore((state) => state.client);
  const handleDeleteSelectedClient = useSaleStore((state) => state.handleDeleteSelectedClient);
  const amountPaid = useSaleStore((state) => state.amountPaid);
  const setAmountPaid = useSaleStore((state) => state.setAmountPaid);

  return (
    <Dialog open={panierDrawerOpen} onOpenChange={setPanierDrawerOpen}>
      <DialogTrigger asChild>
        <div className="relative inline-block">
          <Button variant="outline" className="px-4 py-2">
            <ShoppingCart className="mr-1 h-4 w-4" /> Panier
          </Button>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="min-w-4xl">
        <DialogHeader>
          <DialogTitle>
            <p className="text-lg font-bold mb-4">Récapitulatif de la vente</p>
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-10">
          <div className="space-y-2 max-h-[298px] w-[300px] overflow-y-auto mb-4">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between items-center">
                <div className="">{item.nom}</div>
                <div className="flex items-center space-x-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromCart(item._id)}
                    className="border rounded-full w-8 h-8 text-red-600 hover:bg-red-100 hover:cursor-pointer"
                  >
                    <Minus />
                  </Button>
                  <div>{item.quantity}</div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => addToCart(item)}
                    className="border rounded-full w-8 h-8 text-red-600 hover:bg-red-100 hover:cursor-pointer"
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4  w-[250px]">
            <div>
              <Label className="mb-3">Date de la vente</Label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start pl-3 text-left font-normal",
                        !saleDate && "text-muted-foreground"
                      )}
                    >
                      {saleDate
                        ? format(saleDate, "d MMMM yyyy", {
                            locale: fr,
                          })
                        : "Sélectionner la date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={saleDate}
                      onSelect={setSaleDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label className="mb-3">Remise %</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                min={0}
                step={0.00001}
                max={100}
              />
            </div>

            <div>
              <Label className="mb-3">
                Statut <Required />
              </Label>
              <SaleStatus/>
            </div>

            {saleStatus === "partial" && (
              <div>
                <Label>
                  Montant reçu <Required />
                </Label>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  min={0}
                  step={0.00001}
                  max={total}
                />
              </div>
            )}

            {(saleStatus === "paid" || saleStatus === "partial") && (
              <div>
                <Label className="mb-3">
                  Mode de paiement <Required />
                </Label>
                <PaymentMethod/>
              </div>
            )}

            <div className="font-semibold">Total : {total.toFixed(2)} fcfa</div>
            <Button
              className="w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer"
              onClick={createSale}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>{" "}
                  Enregistrement...
                </>
              ) : (
                "Valider la vente"
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-5">
              <div>
                <h2 className="text-black font-semibold">Infos client</h2>
              </div>
              {client ? (
                <div className="flex space-x-5">
                  {!client?._id && (
                    <div>
                      <Button
                        title="Modifie les infos client."
                        size="icon"
                        variant="ghost"
                        onClick={handleUpdateNewClient}
                        className="border rounded-full w-6 h-6 text-green-600 hover:bg-green-100 hover:cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div>
                    <Button
                      title="Supprimer le client sélectionné."
                      size="icon"
                      variant="ghost"
                      onClick={handleDeleteSelectedClient}
                      className="border rounded-full w-6 h-6 text-green-600 hover:bg-green-100 hover:cursor-pointer"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-5">
                  <div>
                    <Button
                      title="Sélectionner/Ajouter un client."
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setDrawerOpen(false);
                        setSelectClientOpen(true);
                      }}
                      className="border rounded-full w-6 h-6 text-green-600 hover:bg-green-100 hover:cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Nom Complet:</p>
              <p
                className={`font-semibold ${
                  client?.nomComplet ? "text-black" : "text-gray-400 italic"
                }`}
              >
                {client?.nomComplet || "Nom non renseignée"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Téléphone:</p>
              <p
                className={`font-semibold ${
                  client?.tel ? "text-black" : "text-gray-400 italic"
                }`}
              >
                {client?.tel || "Numéro non renseignée"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Email:</p>
              <p
                className={`font-semibold ${
                  client?.email ? "text-black" : "text-gray-400 italic"
                }`}
              >
                {client?.email || "Email non renseigné"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Adresse:</p>
              <p
                className={`font-semibold ${
                  client?.adresse ? "text-black" : "text-gray-400 italic"
                }`}
              >
                {client?.adresse || "Adresse non renseignée"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PanierVente;
