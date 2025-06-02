"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useArticles from "@/hooks/useArticles";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { format } from "date-fns";
import fr from "date-fns/locale/fr";
import {
  Plus,
  Minus,
  ShoppingCart,
  UserPlus,
  CalendarIcon,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { useState } from "react";
import ArticlesFooter from "./ArticlesFooter";
import SearchLoader from "./Search-loader";
import ArticlesHeader from "./ArticlesHeader";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";


const clientsData = [
  { id: "c1", name: "Client A" },
  { id: "c2", name: "Client B" },
];

const DEFAULT_IMAGE = "/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg";

const ArticlesListVente = ({ initialArt, initialTotalPages, currentPage, search }) => {

  const {
    articles,
    deleting,
    handleDelete,
    handleSearchChange,
    isLoading,
    limit,
    modalProdToDelete,
    page,
    searchTerm,
    setLimit,
    setPage,
    selected,
    toggleCategory,
    totalPages,
    setModalProdToDelete,
  } = useArticles(initialArt, initialTotalPages, currentPage, search, 8);

  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [client, setClient] = useState(null);
  const [clientOpen, setClientOpen] = useState(false);
  const [saleDate, setSaleDate] = useState(new Date());
  const [discount, setDiscount] = useState(0);

  const addToCart = (article) => {
    setCart((prev) => {
      const exists = prev.find((item) => item._id === article._id);
      if (exists) {
        return prev.map((item) =>
          item._id === article._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...article, quantity: 1 }];
    });
  };

  const removeFromCart = (articleId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === articleId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total =
    cart.reduce((sum, item) => sum + (item.prixVenteEnGros || item.prixVenteDetail) * item.quantity, 0) *
    (1 - discount / 100);

  const tabSize = [8, 12, 32, 64, 100];

  console.log(cart)

  return (
    <>
        <div className="p-6 space-y-4">
            {/* Barre d'actions fixe */}
            <div className="flex items-center space-x-2 sticky top-0 bg-white z-10 p-2">
                <div>
                    <ArticlesHeader
                      searchTerm={searchTerm}
                      onSearchChange={handleSearchChange}
                      limit={limit}
                      setLimit={setLimit}
                      setPage={setPage}
                      selected={selected}
                      toggleCategory={toggleCategory}
                      tabSize={tabSize}
                    />
                </div>
                <div className="flex gap-2">
                    {/* Choisir client */}
                    <Popover open={clientOpen} onOpenChange={setClientOpen}>
                        <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={clientOpen}
                            className="justify-between"
                        >
                            {client?.name ?? 'Choisir client'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Rechercher un client..." className="h-9" />
                                <CommandList>
                                <CommandEmpty>Aucun client</CommandEmpty>
                                <CommandGroup>
                                    {clientsData.map(opt => (
                                    <CommandItem
                                        key={opt.id}
                                        value={opt.name.toLowerCase()}
                                        onSelect={() => {
                                        setClient(opt);
                                        setClientOpen(false);
                                        }}
                                    >
                                        {opt.name}
                                        <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            client?.id === opt.id ? "opacity-100" : "opacity-0"
                                        )}
                                        />
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                            <Button size="sm" className="mt-2 w-full bg-[#0084D1] rounded hover:bg-[#0042d1]" onClick={() => alert('Ajouter client')}>
                                + Nouveau
                            </Button>
                        </PopoverContent>
                    </Popover>


                    {/* Ouvrir panier */}
                    <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
                        <DialogTrigger asChild>
                        <Button variant="outline" className="px-4 py-2">
                            <ShoppingCart className="mr-1 h-4 w-4" /> Panier ({cart.reduce((a, c) => a + c.quantity, 0)})
                        </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[400px]">
                        <DialogHeader>
                            <DialogTitle>
                            <p className="text-lg font-bold mb-4">
                                Récapitulatif de la vente
                            </p>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {cart.map((item) => (
                            <div
                                key={item._id}
                                className="flex justify-between items-center"
                            >
                                <div>
                                {item.nom} x {item.quantity}
                                </div>
                                <div className="flex items-center space-x-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeFromCart(item._id)}
                                >
                                    <Minus />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => addToCart(item)}
                                >
                                    <Plus />
                                </Button>
                                </div>
                            </div>
                            ))}
                        </div>
                        {/* <div className="space-y-4">
                                <div>
                                    <Label>Date</Label>
                                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Remise %</Label>
                                    <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} min={0} max={100} />
                                </div>
                                <div className="font-semibold">Total : {total.toFixed(2)} €</div>
                                <Button className="w-full" onClick={() => alert('Vente validée')}>Valider la vente</Button>
                            </div> */}

                        <div className="space-y-4">
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
                                            ? format(saleDate, "d MMMM yyyy", { locale: fr })
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

                            <div className="font-semibold">
                                Total : {total.toFixed(2)} fcfa
                            </div>
                            <Button
                            className="w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer"
                            onClick={() => alert("Vente validée")}
                            >
                                Valider la vente
                            </Button>
                        </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {isLoading && <SearchLoader />}

            {/* Corps de page : grille articles */}
            <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {articles.map((article) => {
                    const inCart = cart.find((i) => i._id === article._id);
                    const src = article.image || DEFAULT_IMAGE;
                    return (
                        <Card key={article._id} className="p-4">
                        <img
                            src={src}
                            alt={article.nom}
                            className="w-full h-32 object-cover rounded mb-2"
                            onError={(e) => {
                                e.currentTarget.src = DEFAULT_IMAGE;
                            }}
                        />
                        <CardTitle>{article.nom}</CardTitle>
                        <CardContent className="flex flex-col items-start space-y-2">
                            <div>
                                Prix :{" "}
                                {article.prixVenteEnGros || article.prixVenteDetail} fcfa
                            </div>
                            <div className="flex items-center space-x-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeFromCart(article.id)}
                                disabled={!inCart}
                            >
                                <Minus />
                            </Button>
                            <span>{inCart?.quantity ?? 0}</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => addToCart(article)}
                            >
                                <Plus />
                            </Button>
                            </div>
                        </CardContent>
                        </Card>
                    );
                    })}
                </div>
            </div>
        </div>

        <ArticlesFooter
            limit={limit}
            setLimit={setLimit}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            selected={selected}
            toggleCategory={toggleCategory}
            tabSize={tabSize}
        />
    </>
  );
};

export default ArticlesListVente;
