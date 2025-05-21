"use client"

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DeleteCategory, DeleteCategory2, DetailsCategory, UpdateCategory } from "./button-category";
import Pagination from "./Pagination";
import DeleteCatPopup from "./Delete-cat-popup";
import toast from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/outline";
import SearchLoader from "./Search-loader";
import ExcelExportButton from "./ExcelExportButton";
import { Button } from "../ui/button";

const CategoryTable = ({initialCat, initialTotalPages, currentPage, search}) => {

    const [categories, setCategories] = useState(initialCat)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [page, setPage] = useState(currentPage)
    const [searchTerm, setSearchTerm] = useState(search)
    const [isLoading, setIsLoading] = useState(false)
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [deletingCatId, setDeletingCatId] = useState(null);
    const isFirstRun = useRef(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

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

        const activeSearch = debouncedSearch

        setIsLoading(true)
        fetch(`/api/category?page=${page}&limit=5&search=${activeSearch}`)
          .then(response => response.json())
          .then(({ data, totalPages: tp, currentPage: cp }) => {
            setCategories(data)
            setTotalPages(tp)
            setPage(cp)
        }).catch(error => {
            console.error(error)
            toast.error("Une erreur s'est produite! Veuillez réessayer.")
        }).finally(() => setIsLoading(false))

    },[page, debouncedSearch])

    const handleSearchChange = e => {
        setSearchTerm(e.target.value)
        if (page !== 1) {
            setPage(1)
        }
    }

    const handleDelete = async (id) => {
        setDeleteLoading(true)
        try {
            const response = await fetch(`/api/category/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if(response.ok) {
                toast.success(data.message)
                setCategories(prev => prev.filter(cat => cat._id !== id))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error);
            toast.error("Une erreur s'est produite ! Veuillez réessayer.")
        } finally {
            setDeletingCatId(null)
            setDeleteLoading(false)
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
                    <ExcelExportButton initUrl={"/api/category/export-excel"}/>
                </div>
                <div className="mb-4 ml-4 md:ml-0">
                    <Link href="/dashboard/categorie/ajouter">
                        <Button className="hidden md:block bg-[#0084D1] text-white px-4 py-2 rounded hover:bg-[#0042d1] hover:cursor-pointer">
                            Ajouter une catégorie
                        </Button>
                        <Button className="md:hidden rounded-md border p-2 flex items-center justify-center gap-1 bg-blue-500 text-white hover:bg-blue-600 hover:cursor-pointer">
                            <PlusIcon className="w-5" />
                        </Button>
                    </Link>
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
                            {categories?.map((cat) => (
                                <div key={cat._id} className="rounded-md bg-white p-4 shadow-sm">
                                    <div className="flex justify-between items-start border-b pb-4">
                                    <p className="text-base font-semibold">{cat.nom}</p>
                                    </div>
                                    <div className="pt-4">
                                    <p className="text-sm text-gray-700">{cat.description}</p>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <DetailsCategory id={cat._id}/>
                                        <UpdateCategory id={cat._id}/>
                                        <DeleteCategory2
                                          id={cat._id}
                                          setDeleteId={setDeletingCatId}
                                          deleteCat={handleDelete}
                                          isLoading={deletingCatId === cat._id}
                                          deleteLoading={deleteLoading}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop */}
                        <table className="hidden min-w-full text-gray-900 md:table">
                            <thead className="text-left text-sm font-normal">
                            <tr>
                                <th className="px-4 py-5 font-medium sm:pl-6">Nom</th>
                                <th className="px-3 py-5 font-medium">Description</th>
                                <th className="py-5 pl-6 pr-3 text-right">
                                <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white">
                                {categories.map((cat) => (
                                    <tr key={cat._id} className="border-b last:border-none text-sm">
                                    <td className="whitespace-nowrap py-4 pl-6 pr-3">{cat.nom}</td>
                                    <td className="whitespace-nowrap px-3 py-4">{cat.description}</td>
                                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <DetailsCategory id={cat._id}/>
                                            <UpdateCategory id={cat._id}/>
                                            <DeleteCategory2
                                              id={cat._id}
                                              setDeleteId={setDeletingCatId}
                                              deleteCat={handleDelete}
                                              isLoading={deletingCatId === cat._id}
                                              deleteLoading={deleteLoading}
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

export default CategoryTable;
