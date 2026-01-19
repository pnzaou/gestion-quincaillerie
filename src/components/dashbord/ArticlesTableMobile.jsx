"use client";

import { Package } from "lucide-react";
import { DeleteArticle, DetailsArticle, UpdateArticle } from "./button-article";
import Image from "next/image";

const ArticlesTableMobile = ({
  articles,
  deleting,
  modalProdToDelete,
  setModalProdToDelete,
  handleDelete,
}) => {
  return (
    <div className="md:hidden space-y-2">
      {articles?.map((art) => (
        <div key={art._id} className="rounded-md bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              {/* ✅ Image ou icône Package */}
              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                {art.image ? (
                  <Image
                    src={art.image}
                    alt={art.nom}
                    width={48}
                    height={48}
                    className="rounded object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-base font-semibold">{art.nom}</p>
            </div>
          </div>
          <div className="pt-4 space-y-1">
            <p className="text-sm text-gray-700">Prix: {art.prixVente} fcfa</p>
            <p className="text-sm text-gray-700">Stock: {art.QteStock}</p>
            <p className="text-sm text-gray-700">Réf: {art.reference}</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
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
        </div>
      ))}
    </div>
  );
};

export default ArticlesTableMobile;
