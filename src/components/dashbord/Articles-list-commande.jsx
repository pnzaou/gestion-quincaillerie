"use client"

import useArticles from "@/hooks/useArticles";
import ArticlesHeader from "./ArticlesHeader";
import ArticlesFooter from "./ArticlesFooter";
import OrderSupplierSelector from "./Order-supplier-selector";
import SearchLoader from "./Search-loader";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";

const DEFAULT_IMAGE = "/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg";
const tabSize = [8, 12, 32, 64, 100];

const ArticlesListCommande = ({ initialArt, currentPage, initialTotalPages, search }) => {

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
        totalPages
    } = useArticles(initialArt, initialTotalPages, currentPage, search, 8)

    return (
        <>
            <div className=" space-y-4">
                <div className="flex gap-5 items-center justify-between sticky top-0 bg-white z-10 w-full px-4 py-2">
                    <div className="xl:flex-1">
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
                    <div className="flex items-center gap-5">
                        <OrderSupplierSelector/>
                    </div>

                </div>

                {isLoading && <SearchLoader/>}

                <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {articles?.map((article) => {
                            const src = article.image || DEFAULT_IMAGE
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
                                                {article.prixVenteDetail || article.prixVenteEnGros} fcfa
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

                                        <div className="flex items-center justify-between w-full mt-2">
                                            <Button
                                             size="icon"
                                             variant="ghost"
                                             className="border rounded-full w-8 h-8 text-red-600 hover:bg-red-100 hover:cursor-pointer"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>

                                            <div className="text-center text-sm font-semibold px-3 py-1 border rounded bg-gray-100 min-w-[32px]">
                                                {0}
                                            </div>

                                            <Button
                                             size="icon"
                                             variant="ghost"
                                             className="border rounded-full w-8 h-8 text-green-600 hover:bg-green-100 hover:cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
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
}

export default ArticlesListCommande;
