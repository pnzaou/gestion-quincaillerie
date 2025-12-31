"use client";

import { Package } from "lucide-react";
import { DeleteArticle, DetailsArticle, UpdateArticle } from "./button-article";

const ArticlesTableDesktop = ({
  articles,
  deleting,
  modalProdToDelete,
  setModalProdToDelete,
  handleDelete,
}) => {
  return (
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
              {/* ✅ Image ou icône Package */}
              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                {art.image ? (
                  <img
                    src={art.image}
                    alt={art.nom}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </td>
            <td className="whitespace-nowrap px-3 py-4">{art.nom}</td>
            <td className="whitespace-nowrap px-3 py-4">
              {art.prixVente} fcfa
            </td>
            <td className="whitespace-nowrap px-3 py-4">{art.QteStock}</td>
            <td className="whitespace-nowrap px-3 py-4">{art.reference}</td>
            <td className="whitespace-nowrap py-4 pl-6 pr-3 text-right">
              <div className="flex justify-end gap-2">
                <DetailsArticle id={art._id} />
                <UpdateArticle id={art._id} />
                <DeleteArticle
                  id={art._id}
                  open={modalProdToDelete === art._id}
                  onOpenChange={setModalProdToDelete}
                  onConfirm={handleDelete}
                  loading={deleting.id === art._id && deleting.loading}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ArticlesTableDesktop;
