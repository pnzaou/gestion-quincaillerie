"use client"

import { useState } from "react";
import { DeleteArticle, DetailsArticle, UpdateArticle } from "./button-article";

const ArticlesTable = ({initialArt, initialTotalPages, currentPage, search}) => {
    const [articles, setArticles] = useState(initialArt);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [page, setPage] = useState(currentPage);
    const [isLoading, setIsLoading] = useState(false);

    console.log(articles)

    return (
        <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
    
              {/* Mobile */}
              <div className="md:hidden space-y-2">
                {articles?.map((art) => (
                  <div key={art._id} className="rounded-md bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        <img src={art.image || "/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg"} alt={art.nom} className="h-10 w-10 rounded object-cover" />
                        <p className="text-base font-semibold">{art.nom}</p>
                      </div>
                    </div>
                    <div className="pt-4 space-y-1">
                      <p className="text-sm text-gray-700">Prix: {art.prixVenteDetail ? art.prixVenteDetail : art.prixVenteEnGros} xof</p>
                      <p className="text-sm text-gray-700">Stock: {art.QteStock}</p>
                      <p className="text-sm text-gray-700">Réf: {art.reference}</p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <DetailsArticle id={art._id} />
                      <UpdateArticle id={art._id} />
                      <DeleteArticle
                        id={art._id}
                      />
                    </div>
                  </div>
                ))}
              </div>
    
              {/* Desktop */}
              <table className="hidden min-w-full text-gray-900 md:table">
                <thead className="text-left text-sm font-normal">
                  <tr>
                    <th className="px-4 py-5 font-medium sm:pl-6"></th>
                    <th className="px-3 py-5 font-medium">Nom</th>
                    <th className="px-3 py-5 font-medium">Prix de vente</th>
                    <th className="px-3 py-5 font-medium">Qte en stock</th>
                    <th className="px-3 py-5 font-medium">Référence</th>
                    <th className="py-5 pl-6 pr-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {articles?.map((art) => (
                    <tr key={art._id} className="border-b last:border-none text-sm">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        <img src={art.image || "/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg"} alt={art.nom} className="h-10 w-10 rounded object-cover" />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">{art.nom}</td>
                      <td className="whitespace-nowrap px-3 py-4">{art.prixVenteDetail ? art.prixVenteDetail : art.prixVenteEnGros} xof</td>
                      <td className="whitespace-nowrap px-3 py-4">{art.QteStock}</td>
                      <td className="whitespace-nowrap px-3 py-4">{art.reference}</td>
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-right">
                        <div className="flex justify-end gap-2">
                          <DetailsArticle id={art._id} />
                          <UpdateArticle id={art._id} />
                          <DeleteArticle
                            id={art._id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
    
            </div>
          </div>
        </div>
      );
}

export default ArticlesTable;
