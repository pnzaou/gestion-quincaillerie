"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useArticles from "@/hooks/useArticles";
import { cn } from "@/lib/utils";
import { Plus, Minus, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ArticlesFooter from "./ArticlesFooter";
import SearchLoader from "./Search-loader";
import ArticlesHeader from "./ArticlesHeader";
import { Badge } from "../ui/badge";
import SaleClientSelector from "./Sale-client-selector";
import { useSaleStore } from "@/stores/useSaleStore";
import { useQuoteStore } from "@/stores/useQuoteStore";
import PanierVente from "./Panier-vente";
import toast from "react-hot-toast";
import { QuotePreview, QuotePrint } from "./Quote-Preview";
import Image from "next/image";
import { SalePreviewDialog } from "./Sale-preview-dialog";
import { InvoicePrint } from "./Invoice-print";
import { ReceiptPrint } from "./Receipt-print";

const tabSize = [8, 12, 32, 64, 100];

const ArticlesListVente = ({
  initialArt,
  initialTotalPages,
  currentPage,
  search,
}) => {
  const params = useParams();
  const shopId = params?.shopId;
  const setShopId = useSaleStore((state) => state.setShopId);

  const quotePreviewOpen = useQuoteStore((state) => state.quotePreviewOpen);
  const setQuotePreviewOpen = useQuoteStore((state) => state.setQuotePreviewOpen);
  const currentQuote = useQuoteStore((state) => state.currentQuote);
  const savedCartForRestore = useQuoteStore((state) => state.savedCartForRestore);

  useEffect(() => {
    if (shopId) {
      setShopId(shopId);
    }
  }, [shopId, setShopId]);

  useEffect(() => {
    if (!quotePreviewOpen && savedCartForRestore.length > 0) {
      setLocalStocks((prev) => {
        const newStocks = { ...prev };
        savedCartForRestore.forEach((item) => {
          if (newStocks[item._id] !== undefined) {
            newStocks[item._id] += item.quantity;
          }
        });
        return newStocks;
      });
      
      useQuoteStore.setState({ savedCartForRestore: [] });
    }
  }, [quotePreviewOpen, savedCartForRestore]);

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
  } = useArticles(initialArt, initialTotalPages, currentPage, search, 8);

  const cart = useSaleStore((state) => state.cart);
  const addToCart = useSaleStore((state) => state.addToCart);
  const removeFromCart = useSaleStore((state) => state.removeFromCart);
  const updateCartQuantity = useSaleStore((state) => state.updateCartQuantity);
  const invoicePreviewOpen = useSaleStore((state) => state.invoicePreviewOpen);
  const setInvoicePreviewOpen = useSaleStore((state) => state.setInvoicePreviewOpen);
  const currentSale = useSaleStore((state) => state.currentSale);
  const currentPayments = useSaleStore((state) => state.currentPayments);

  const [printMode, setPrintMode] = useState(null);
  const [quotePrintMode, setQuotePrintMode] = useState(false);
  const [localStocks, setLocalStocks] = useState(() =>
    Object.fromEntries(initialArt.map((a) => [a._id, a.QteStock]))
  );

  const isFirstRun = useRef(false);

  useEffect(() => {
    if (!isFirstRun.current) {
      isFirstRun.current = true;
      return;
    }
    setLocalStocks((prev) =>
      Object.fromEntries(articles.map((a) => [a._id, a.QteStock]))
    );
  }, [articles]);

  const handleQuantityChange = (article, newQuantity) => {
    const qty = parseInt(newQuantity) || 0;
    const maxStock = localStocks[article._id] ?? article.QteStock;
    const inCart = cart.find((i) => i._id === article._id);
    const currentCartQty = inCart?.quantity || 0;
    
    const availableStock = maxStock + currentCartQty;
    
    if (qty < 0) return;
    if (qty > availableStock) {
      toast.error(`Stock insuffisant. Maximum: ${availableStock}`);
      return;
    }

    updateCartQuantity(article, qty, localStocks, setLocalStocks);
  };

  const handlePrintQuote = () => {
    setQuotePrintMode(true); 
    setTimeout(() => {
      window.print();
      setQuotePrintMode(false);
    }, 300);
  };

  return (
    <>
      <div className={printMode || quotePrintMode ? "hidden" : "space-y-4"}>
        {/* ✅ Header sticky amélioré pour mobile */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3">
          <div className="space-y-3">
            {/* Ligne 1: Recherche + Panier (toujours visible) */}
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
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
              <div className="flex-shrink-0">
                <PanierVente
                  localStocks={localStocks}
                  setLocalStocks={setLocalStocks}
                />
              </div>
            </div>

            {/* Ligne 2: Sélecteur client (pleine largeur sur mobile) */}
            <div className="w-full">
              <SaleClientSelector />
            </div>
          </div>
        </div>

        {isLoading && <SearchLoader />}

        <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {articles.map((article) => {
              const inCart = cart.find((i) => i._id === article._id);

              return (
                <Card key={article._id} className="p-3 hover:shadow-lg transition-shadow duration-150">
                  {/* Image */}
                  <div className="overflow-hidden rounded bg-muted flex items-center justify-center h-32 sm:h-40 md:h-36 lg:h-40 relative">
                    {article.image ? (
                      <Image
                        src={article.image}
                        alt={article.nom}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover rounded"
                      />
                    ) : (
                      <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                    )}
                  </div>

                  <CardTitle className="mt-3 text-sm sm:text-base truncate">
                    {article.nom}
                  </CardTitle>
                  
                  <CardContent className="flex flex-col space-y-3 mt-2 p-0">
                    <div className="text-center">
                      <span className="text-base sm:text-lg text-black font-semibold">
                        {article.prixVente} FCFA
                      </span>
                    </div>

                    <div className="text-sm text-center">
                      <Badge
                        className={cn(
                          'text-xs font-semibold',
                          article.QteStock > 10
                            ? 'bg-green-100 text-green-800'
                            : article.QteStock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >
                        {localStocks[article._id] ?? article.QteStock} en stock
                      </Badge>
                    </div>

                    <div className="flex items-center justify-center w-full mt-2 gap-1.5 sm:gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(article._id, setLocalStocks)}
                        disabled={!inCart}
                        className="border rounded-full w-8 h-8 sm:w-9 sm:h-9 text-red-600 hover:bg-red-50 flex-shrink-0"
                        aria-label={`Retirer ${article.nom}`}
                      >
                        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>

                      <Input
                        type="number"
                        min="0"
                        value={inCart?.quantity ?? 0}
                        onChange={(e) => handleQuantityChange(article, e.target.value)}
                        className="text-center h-8 sm:h-9 w-12 sm:w-16 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => addToCart(article, localStocks, setLocalStocks)}
                        className="border rounded-full w-8 h-8 sm:w-9 sm:h-9 text-green-600 hover:bg-green-50 flex-shrink-0"
                        aria-label={`Ajouter ${article.nom}`}
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6">
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
      </div>

      <SalePreviewDialog
        open={invoicePreviewOpen}
        onOpenChange={setInvoicePreviewOpen}
        sale={currentSale}
        payments={currentPayments}
        onPrintModeChange={setPrintMode}
      />

      {printMode === "invoice" && currentSale && (
        <InvoicePrint sale={currentSale} payments={currentPayments} />
      )}
      {printMode === "receipt" && currentSale && (
        <ReceiptPrint sale={currentSale} payments={currentPayments} />
      )}

      <QuotePreview
        open={quotePreviewOpen}
        onOpenChange={setQuotePreviewOpen}
        quote={currentQuote}
        onPrint={handlePrintQuote}
      />

      {quotePrintMode && currentQuote && (
        <QuotePrint quote={currentQuote} />
      )}
    </>
  );
};

export default ArticlesListVente;