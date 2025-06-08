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
  CalendarIcon,
  Trash,
  Pencil,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ArticlesFooter from "./ArticlesFooter";
import SearchLoader from "./Search-loader";
import ArticlesHeader from "./ArticlesHeader";
import { Badge } from "../ui/badge";
import PaymentMethod from "./Payment-method";
import SaleClientSelector from "./Sale-client-selector";
import Required from "../Required";
import toast from "react-hot-toast";

const DEFAULT_IMAGE = "/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg";
const tabSize = [8, 12, 32, 64, 100];

const ArticlesListVente = ({ initialArt, initialTotalPages, currentPage, search }) => {

  const {
    articles,
    handleSearchChange,
    isLoading,
    limit,
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
  const [localStocks, setLocalStocks] = useState(() => Object.fromEntries(initialArt.map(a => [a._id, a.QteStock])))
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saleDate, setSaleDate] = useState(new Date());
  const [discount, setDiscount] = useState(0);
  const [paiementMethode, setPaiementMethode] = useState("")
  const [client, setClient] = useState(null);
  const [selectClientOpen, setSelectClientOpen] = useState(false);
  const [newClientDrawerOpen, setNewClientDrawerOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    nomComplet: "",
    tel: "",
    email: "",
    adresse: "",
  })
  const [loading, setLoading] = useState(false)

  const isFirstRun = useRef(false)

    useEffect(() => {
        if (!isFirstRun.current) {
        isFirstRun.current = true
        return
        }
        setLocalStocks((prev) => Object.fromEntries(articles.map(a => [a._id, a.QteStock])))
    }, [articles])

  const addToCart = (article) => {
    const currentStock = localStocks[article._id] ?? article.QteStock;

    if (currentStock <= 0) {
      return;
    }

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

    setLocalStocks((prev) => ({
      ...prev,
      [article._id]: prev[article._id] - 1,
    }));
  };

  const removeFromCart = (articleId) => {
    const item = cart.find((i) => i._id === articleId);

    if (!item) {
      return;
    }
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === articleId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    setLocalStocks((prev) => ({
     ...prev,
      [articleId]: prev[articleId] + 1,
    }));
  };

    const total = (
        cart.reduce((sum, item) => {
        const prix = item.prixVenteDetail ?? item.prixVenteEnGros;
        return sum + prix * item.quantity;
        }, 0)
    ) * (1 - discount / 100);

    const handleUpdateNewClient = () => {
        setDrawerOpen(false)
        setSelectClientOpen(true)
        setNewClientDrawerOpen(true)
        setNewClient(client)
    }

    const handleDeleteSelectedClient = () => {
        setClient(null)
        setNewClient({
            nomComplet: "",
            tel: "",
            email: "",
            adresse: "",
          })
    }

    const handleSubmitSale = async (e) => {
        setLoading(true)
        try {
            if(cart.length === 0) {
                toast.error("Veuillez ajouter des articles au panier.")
                return;
            }
            if(!paiementMethode || paiementMethode.trim() === "") {
                toast.error("Veuillez choisir un mode de paiement.")
                return;
            }
            const data = {
                items: cart.map((item) => ({
                    product: item._id,
                    quantity: item.quantity,
                    price: item.prixVenteDetail?? item.prixVenteEnGros,
                })),
                dateExacte: saleDate,
                remise: discount,
                total,
                paymentMethod: paiementMethode,
                client
            }
            const response = await fetch("/api/sale", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            if(response.ok) {
                toast.success("Vente créée avec succès.")
                setCart([])
                setClient(null)
                setSaleDate(new Date())
                setDiscount(0)
                setPaiementMethode("")
                return;
            } else {
                const errorData = await response.json()
                toast.error(errorData.message)
                return;
            }
        } catch (error) {
            console.error("Erreur pendant la création de la vente :", error);
            toast.error("Une erreur est survenue lors de la création de la vente.")
        } finally {
            setLoading(false)
        }
    }

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
                    <SaleClientSelector
                     selectClientOpen={selectClientOpen}
                     setSelectClientOpen={setSelectClientOpen}
                     client={client}
                     setClient={setClient}
                     newClient={newClient}
                     setNewClient={setNewClient}
                     newClientDrawerOpen={newClientDrawerOpen}
                     setNewClientDrawerOpen={setNewClientDrawerOpen}
                     />

                    {/* Ouvrir panier */}
                    <Dialog open={drawerOpen} onOpenChange={setDrawerOpen} >
                        <DialogTrigger asChild>
                        <Button variant="outline" className="px-4 py-2">
                            <ShoppingCart className="mr-1 h-4 w-4" /> Panier ({cart.reduce((a, c) => a + c.quantity, 0)})
                        </Button>
                        </DialogTrigger>
                        <DialogContent className="min-w-4xl">
                            <DialogHeader>
                                <DialogTitle>
                                <p className="text-lg font-bold mb-4">
                                    Récapitulatif de la vente
                                </p>
                                </DialogTitle>
                            </DialogHeader>
                            <div className="flex gap-10">
                                <div className="space-y-2 max-h-[298px] w-[300px] overflow-y-auto mb-4">
                                    {cart.map((item) => (
                                    <div
                                        key={item._id}
                                        className="flex justify-between items-center"
                                    >
                                        <div className="">
                                            { item.nom }
                                        </div>
                                        <div className="flex items-center space-x-4">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeFromCart(item._id)}
                                            className="border rounded-full w-8 h-8 text-red-600 hover:bg-red-100 hover:cursor-pointer"
                                        >
                                            <Minus />
                                        </Button>
                                        <div>{ item.quantity }</div>
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

                                    <div>
                                        <Label className="mb-3">Mode de paiement <Required/></Label>
                                        <PaymentMethod paiementMethode={paiementMethode} setPaiementMethode={setPaiementMethode}/>
                                    </div>

                                    <div className="font-semibold">
                                        Total : {total.toFixed(2)} fcfa
                                    </div>
                                    <Button
                                      className="w-full bg-[#0084D1] hover:bg-[#0042d1] hover:cursor-pointer"
                                      onClick={handleSubmitSale}
                                    >
                                        Valider la vente
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex space-x-5">
                                        <div>
                                            <h2 className="text-black font-semibold">Infos client</h2>
                                        </div>
                                        {client && (
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
                                                </div>)}
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
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">Nom Complet:</p>
                                        <p className={`font-semibold ${client?.nomComplet ? 'text-black' : 'text-gray-400 italic'}`}>
                                            {client?.nomComplet || "Nom non renseignée"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">Téléphone:</p>
                                        <p className={`font-semibold ${client?.tel ? 'text-black' : 'text-gray-400 italic'}`}>
                                            {client?.tel || "Numéro non renseignée"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">Email:</p>
                                        <p className={`font-semibold ${client?.email ? 'text-black' : 'text-gray-400 italic'}`}>
                                            {client?.email || "Email non renseigné"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">Adresse:</p>
                                        <p className={`font-semibold ${client?.adresse ? 'text-black' : 'text-gray-400 italic'}`}>
                                            {client?.adresse || "Adresse non renseignée"}
                                        </p>
                                    </div>
                                </div>
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
                            <CardContent className="flex flex-col space-y-3 mt-2">
                                <div className="text-center">
                                    <span className="text-lg text-black font-semibold">
                                        {article.prixVenteDetail ?? article.prixVenteEnGros} FCFA
                                    </span>
                                </div>

                                <div className="text-sm text-center">
                                    <Badge
                                    className={cn(
                                        "text-xs font-semibold",
                                        article.QteStock > 10
                                        ? "bg-green-100 text-green-800"
                                        : article.QteStock > 0
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    )}
                                    >
                                        {localStocks[article._id] ?? article.QteStock} en stock
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between w-full mt-2">
                                    <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeFromCart(article._id)}
                                    disabled={!inCart}
                                    className="border rounded-full w-8 h-8 text-red-600 hover:bg-red-100 hover:cursor-pointer"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>

                                    <div className="text-center text-sm font-semibold px-3 py-1 border rounded bg-gray-100 min-w-[32px]">
                                        {inCart?.quantity ?? 0}
                                    </div>

                                    <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => addToCart(article)}
                                    className="border rounded-full w-8 h-8 text-green-600 hover:bg-green-100 hover:cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" />
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
