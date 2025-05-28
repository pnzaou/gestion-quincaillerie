"use client";

import { DeleteArticle, DetailsArticle, UpdateArticle } from "./button-article";

const ArticlesTableMobile = ({articles, deleting, modalProdToDelete, setModalProdToDelete, handleDelete}) => {
    
    return (
        <div className="md:hidden space-y-2">
            {articles?.map((art) => (
                <div
                key={art._id}
                className="rounded-md bg-white p-4 shadow-sm"
                >
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-4">
                        <img
                            src={
                            art.image ||
                            "/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg"
                            }
                            alt={art.nom}
                            className="h-12 w-12 rounded object-cover"
                        />
                        <p className="text-base font-semibold">{art.nom}</p>
                        </div>
                    </div>
                    <div className="pt-4 space-y-1">
                        <p className="text-sm text-gray-700">
                            Prix:{" "}
                            {art.prixVenteDetail
                                ? art.prixVenteDetail
                                : art.prixVenteEnGros}{" "}
                            xof
                        </p>
                        <p className="text-sm text-gray-700">
                            Stock: {art.QteStock}
                        </p>
                        <p className="text-sm text-gray-700">
                            Réf: {art.reference}
                        </p>
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
}

export default ArticlesTableMobile;
