"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import useArticles from "@/hooks/useArticles";
import { cn } from "@/lib/utils";
import {
  Plus,
  Minus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ArticlesFooter from "./ArticlesFooter";
import SearchLoader from "./Search-loader";
import ArticlesHeader from "./ArticlesHeader";
import { Badge } from "../ui/badge";
import SaleClientSelector from "./Sale-client-selector";
import { useSaleStore } from "@/stores/useSaleStore";
import PanierVente from "./Panier-vente";

const DEFAULT_IMAGE = "/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg";
const tabSize = [8, 12, 32, 64, 100];

const ArticlesListVente = ({
  initialArt,
  initialTotalPages,
  currentPage,
  search,
}) => {
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


  return (
    <>
      <div className="space-y-4">
        {/* Barre d'actions fixe */}
        <div className="flex items-center space-x-2 sticky top-0 bg-white z-10">
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
            <SaleClientSelector/>

            {/* Ouvrir panier */}
            <PanierVente localStocks={localStocks} setLocalStocks={setLocalStocks} />
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
                        {article.prixVenteDetail ?? article.prixVenteEnGros}{" "}
                        FCFA
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
                        onClick={() => removeFromCart(article._id, setLocalStocks)}
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
                        onClick={() => addToCart(article, localStocks, setLocalStocks)}
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
