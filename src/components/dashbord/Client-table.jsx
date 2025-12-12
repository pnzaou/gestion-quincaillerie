"use client"

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DeleteCategory, UpdateCategory, DetailsClient } from "./button-client";
import Pagination from "./Pagination";
import toast from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/outline";
import SearchLoader from "./Search-loader";
import ExcelExportButton from "./ExcelExportButton";
import { Button } from "../ui/button";

const ClientTable = ({initialClient, initialTotalPages, currentPage, search}) => {
    const params = useParams();
    const shopId = params?.shopId; // ✅ Récupérer shopId

    const [clients, setClients] = useState(initialClient)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [page, setPage] = useState(currentPage)

    const [searchTerm, setSearchTerm] = useState(search)
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [isLoading, setIsLoading] = useState(false)

    const [deleting, setDeleting] = useState({ id: null, loading: false });
    const [modalCatToDelete, setModalCatToDelete] = useState(null)
    
    const isFirstRun = useRef(false)

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

        if(debouncedSearch.length > 0 && debouncedSearch.length < 3) {
            return;
        }

        if (!shopId) return; // ✅ Vérifier shopId

        const activeSearch = debouncedSearch

        setIsLoading(true)
        // ✅ Ajouter businessId à la requête
        fetch(`/api/client?page=${page}&limit=5&search=${activeSearch}&businessId=${shopId}`)
          .then(response => response.json())
          .then(({ data, totalPages: tp, currentPage: cp }) => {
            setClients(data)
            setTotalPages(tp)
            setPage(cp)
        }).catch(error => {
            console.error(error)
            toast.error("Une erreur s'est produite! Veuillez réessayer.")
        }).finally(() => setIsLoading(false))

    },[page, debouncedSearch, shopId]) // ✅ Ajouter shopId aux dépendances

    const handleSearchChange = e => {
        setSearchTerm(e.target.value)
        if (page !== 1) {
            setPage(1)
        }
    }

    const handleDelete = async (id) => {
        setDeleting({ id, loading: true })
        try {
            const response = await fetch(`/api/client/${id}`, { method: "DELETE" })
            const data = await response.json();

            if(response.ok) {
                toast.success(data.message)
                setClients(prev => prev.filter(client => client._id !== id))
                setModalCatToDelete(null)
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
              placeholder="Rechercher par nom (min. 3 caractères)"
              className="w-full md:w-1/2 px-4 py-2 border rounded-md"
            />
          </div>
          <div className="hidden mb-4 mr-4 md:block">
            <ExcelExportButton initUrl={`/api/client/export-excel?businessId=${shopId}`} />
          </div>
          <div className="mb-4 ml-4 md:ml-0">
            <Link href={`/shop/${shopId}/dashboard/client/ajouter`}>
              <Button className="hidden md:block bg-[#0084D1] text-white px-4 py-2 rounded hover:bg-[#0042d1] hover:cursor-pointer">
                Ajouter un client
              </Button>
              <Button className="md:hidden rounded-md border p-2 flex items-center justify-center gap-1 bg-blue-500 text-white hover:bg-blue-600 hover:cursor-pointer">
                <PlusIcon className="w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Loader */}
        {isLoading && <SearchLoader />}

        <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              {/* Mobile */}
              <div className="md:hidden space-y-2">
                {clients?.length ? (
                  clients.map((client) => (
                    <div
                      key={client._id}
                      className="rounded-md bg-white p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-base font-semibold">
                          {client.nomComplet}
                        </p>
                        <div className="text-sm text-gray-600 whitespace-nowrap">
                          {client.tel || "—"}
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-700">
                        <p className="truncate">
                          <span className="font-medium">Email: </span>
                          {client.email || "—"}
                        </p>
                        <p className="mt-1 truncate">
                          <span className="font-medium">Adresse: </span>
                          {client.adresse || "—"}
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <DetailsClient id={client._id} />
                        <UpdateCategory id={client._id} />
                        <DeleteCategory
                          id={client._id}
                          open={modalCatToDelete === client._id}
                          onOpenChange={setModalCatToDelete}
                          onConfirm={handleDelete}
                          loading={
                            deleting.id === client._id && deleting.loading
                          }
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md bg-white p-4 text-center text-sm text-gray-600">
                    Aucun client trouvé.
                  </div>
                )}
              </div>

              {/* Desktop */}
              <table className="hidden min-w-full text-gray-900 md:table">
                <thead className="text-left text-sm font-normal">
                  <tr>
                    <th className="px-4 py-5 font-medium sm:pl-6">
                      Nom Complet
                    </th>
                    <th className="px-3 py-5 font-medium">Téléphone</th>
                    <th className="px-3 py-5 font-medium">Email</th>
                    <th className="px-3 py-5 font-medium">Adresse</th>
                    <th className="py-5 pl-6 pr-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {clients.map((client) => (
                    <tr
                      key={client._id}
                      className="border-b last:border-none text-sm"
                    >
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
                        {client.nomComplet}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {client.tel}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {client.email || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {client.adresse || "—"}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-right">
                        <div className="flex justify-end gap-2">
                          <DetailsClient id={client._id} />
                          <UpdateCategory id={client._id} />
                          <DeleteCategory
                            id={client._id}
                            open={modalCatToDelete === client._id}
                            onOpenChange={setModalCatToDelete}
                            onConfirm={handleDelete}
                            loading={
                              deleting.id === client._id && deleting.loading
                            }
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

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </>
    );
}

export default ClientTable;