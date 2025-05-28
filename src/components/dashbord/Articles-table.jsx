"use client"

import { useEffect, useRef, useState } from "react";
import { DeleteArticle, DetailsArticle, UpdateArticle } from "./button-article";
import Pagination from "./Pagination";
import SearchLoader from "./Search-loader";
import { PlusIcon } from "@heroicons/react/24/outline";
import Link  from "next/link";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import PageSizeSelect from "./Page-size-select";
import CategoryFilter from "./Category-filter";

const ArticlesTable = ({initialArt, initialTotalPages, currentPage, search}) => {

    const [articles, setArticles] = useState(initialArt);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [page, setPage] = useState(currentPage);

    const [searchTerm, setSearchTerm] = useState(search)
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [limit, setLimit] = useState(10);
    const [selected, setSelected] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [deleting, setDeleting] = useState({ id: null, loading: false });
    const [modalProdToDelete, setModalProdToDelete] = useState(null)

    const isFirstRun = useRef(false);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearch(searchTerm);
      }, 500);
      return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
      if (!isFirstRun.current) {
        isFirstRun.current = true;
        return;
      }

      if (debouncedSearch.length > 0 && debouncedSearch.length < 3) {
        return;
      }

      const activeSearch = debouncedSearch

      setIsLoading(true)
      fetch(`/api/product?page=${page}&limit=${limit}&search=${activeSearch}&categories=${selected.join(",")}`)
        .then(res => res.json())
        .then(({data, totalPages: tp, currentPage: cp}) => {
          setArticles(data);
          setTotalPages(tp);
          setPage(cp)
        }).catch(err => {
          console.error(err)
          toast.error("Une erreur s'est produite! Veuillez réessayer.")
        }).finally(() => setIsLoading(false))

    },[debouncedSearch, page, limit, selected])

    const handleSearchChange = e => {
      setSearchTerm(e.target.value);
      if (page !== 1) {
        setPage(1);
      }
    };

    const toggleCategory = (categoryId) => {
      setSelected(prev =>
        prev.includes(categoryId)
          ? prev.filter(id => id !== categoryId)
          : [...prev, categoryId]
      );
    };

    const handleDelete = async (id) => {
      setDeleting({ id, loading: true })
      try {
          const response = await fetch(`/api/product/${id}`, { method: "DELETE" })
          const data = await response.json();

          if(response.ok) {
              toast.success(data.message)
              setArticles(prev => prev.filter(art => art._id !== id))
              setModalProdToDelete(null)
          } else {
              toast.error(data.message)
          }
      } catch (error) {
          console.error(error);
          toast.error("Une erreur s'est produite ! Veuillez réessayer.")
      } finally {
          setDeleting({ id: null, loading: false })
      }
    }

    return (
      <>
        {/* Barre de recherche, bouton exporter et bouton ajouter */}
        <div className="flex justify-between items-center">
          <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 flex-1/2">
              <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Rechercher par nom, par ref (min. 3 caractères)"
              className="w-full md:w-1/2 px-4 py-2 border rounded-md"
              />
          </div>
          <div className="hidden mb-4 mr-4 md:block">
            <PageSizeSelect limit={limit} setLimit={setLimit} setPage={setPage} />
          </div>
          <div className="hidden mb-4 ml-4 md:ml-0 md:block">
              <CategoryFilter selected={selected} toggleCategory={toggleCategory}/>
          </div>
        </div>

        {/* Loader */}
        {isLoading && (
          <SearchLoader/>
        )}

        <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              {/* Mobile */}
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
                    <tr
                      key={art._id}
                      className="border-b last:border-none text-sm"
                    >
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        <img
                          src={
                            art.image ||
                            "/360_F_517535712_q7f9QC9X6TQxWi6xYZZbMmw5cnLMr279.jpg"
                          }
                          alt={art.nom}
                          className="h-12 w-12 rounded object-cover"
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">{art.nom}</td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {art.prixVenteDetail
                          ? art.prixVenteDetail
                          : art.prixVenteEnGros}{" "}
                        xof
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {art.QteStock}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {art.reference}
                      </td>
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
            </div>
          </div>
        </div>

        {/*SizeChange, CatChange et Pagination */}
        <div className="flex flex-col items-center md:flex-row">
          <div className="mt-6 flex-1/3 order-2 md:order-1">
            <PageSizeSelect limit={limit} setLimit={setLimit} setPage={setPage} />
          </div>
          <div className="flex-1/3 order-1 md:order-2">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
          <div className="flex justify-end mt-6 flex-1/3 order-3">
            <CategoryFilter selected={selected} toggleCategory={toggleCategory}/>
          </div>
        </div>
      </>
    );
}

export default ArticlesTable;
