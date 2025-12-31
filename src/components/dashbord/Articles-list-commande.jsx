"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import useArticles from "@/hooks/useArticles";
import ArticlesHeader from "./ArticlesHeader";
import ArticlesFooter from "./ArticlesFooter";
import OrderSupplierSelector from "./Order-supplier-selector";
import SearchLoader from "./Search-loader";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Minus, Plus, Package } from "lucide-react";
import { useOrderStore } from "@/stores/useOrderStore";
import PanierCommande from "./Panier-commande";
import toast from "react-hot-toast";

const tabSize = [8, 12, 32, 64, 100];

const ArticlesListCommande = ({
  initialArt,
  currentPage,
  initialTotalPages,
  search,
}) => {
  const params = useParams();
  const shopId = params?.shopId;
  const setShopId = useOrderStore((state) => state.setShopId);
  const cart = useOrderStore((state) => state.cart);
  const addToCart = useOrderStore((state) => state.addToCart);
  const removeFromCart = useOrderStore((state) => state.removeFromCart);
  const updateCartQuantity = useOrderStore((state) => state.updateCartQuantity);

  useEffect(() => {
    if (shopId) {
      setShopId(shopId);
    }
  }, [shopId, setShopId]);

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

  const sortedArticles = [...articles].sort((a, b) => a.QteStock - b.QteStock);

  const handleQuantityChange = (article, newQuantity) => {
    const qty = parseInt(newQuantity) || 0;
    
    if (qty < 0) return;

    updateCartQuantity(article, qty);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 py-3">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
              <div className="flex-1 w-full">
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

              <div className="flex-shrink-0 flex items-center gap-3">
                <OrderSupplierSelector />
                <PanierCommande />
              </div>
            </div>
          </div>
        </div>

        {isLoading && <SearchLoader />}

        <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedArticles.map((article) => {
              const inCart = cart.find((i) => i._id === article._id);

              return (
                <Card
                  key={article._id}
                  className="p-3 hover:shadow-lg transition-shadow duration-150"
                >
                  {/* ✅ Image ou icône Package */}
                  <div className="overflow-hidden rounded bg-muted flex items-center justify-center h-40 sm:h-44 md:h-36 lg:h-40">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.nom}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>

                  <CardTitle className="mt-3 text-sm sm:text-base truncate">
                    {article.nom}
                  </CardTitle>

                  <CardContent className="flex flex-col space-y-3 mt-2">
                    <div className="text-center">
                      <span className="text-lg text-black font-semibold">
                        {article.prixAchat} fcfa
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
                        {article.QteStock} en stock
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between w-full mt-2 gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(article._id)}
                        disabled={!inCart}
                        className="border rounded-full w-9 h-9 text-red-600 hover:bg-red-50 flex-shrink-0"
                        aria-label={`Retirer ${article.nom}`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <Input
                        type="number"
                        min="0"
                        value={inCart?.quantity ?? 0}
                        onChange={(e) => handleQuantityChange(article, e.target.value)}
                        className="text-center h-9 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => addToCart(article)}
                        className="border rounded-full w-9 h-9 text-green-600 hover:bg-green-50 flex-shrink-0"
                        aria-label={`Ajouter ${article.nom}`}
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
    </>
  );
};

export default ArticlesListCommande;