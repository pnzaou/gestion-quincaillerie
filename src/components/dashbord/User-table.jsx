"use client"

import { DeleteUser, UpdateUser, UserStatus } from "@/components/dashbord/button-user";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import Pagination from "./Pagination";
import Link from "next/link";
import { UserPlusIcon } from "@heroicons/react/24/outline"
import SearchLoader from "./Search-loader";

const UserTable = ({initialUsers, initialTotalPages, currentPage, search}) => {
    const [users, setUsers] = useState(initialUsers)
    const [searchTerm, setSearchTerm] = useState(search)
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [page, setPage] = useState(currentPage)
    const [totalPages, setTotalPages] = useState(initialTotalPages)
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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

        const activeSearch = debouncedSearch

        setIsLoading(true)
        fetch(`/api/user?page=${page}&limit=5&search=${activeSearch}`)
          .then(response => response.json())
          .then(({ data, totalPages: tp, currentPage: cp }) => {
            setUsers(data)
            setTotalPages(tp)
            setPage(cp)
        })
         .catch(error => {
            console.error(error)
            toast.error("Une erreur s'est produite! Veuillez réessayer.")
        }).finally(() => setIsLoading(false))
        
    }, [page, debouncedSearch])

    const handleSearchChange = e => {
        setSearchTerm(e.target.value)
        if (page !== 1) {
            setPage(1)
        }
    }
    
    const handleDelete = async (id) => {
        setDeletingUserId(id)
        try {
            const response = await fetch(`/api/user/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if(response.ok) {
                toast.success(data.message)
                setUsers(prev => prev.filter(user => user._id !== id))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error);
            toast.error("Une erreur s'est produite ! Veuillez réessayer.")
        } finally {
            setDeletingUserId(null)
        }
    }

    return (
        <>
            {/* Barre de recherche et bouton ajouter */}
            <div className="flex justify-between items-center">
                <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 flex-1/2">
                    <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Rechercher par nom ou prénom (min. 3 caractères)"
                    className="w-full md:w-1/2 px-4 py-2 border rounded-md"
                    />
                </div>
                <div className="mb-4 ml-4 md:ml-0">
                    <Link href="/dashboard/utilisateur/creer">
                        <button className="hidden md:block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 hover:cursor-pointer">
                            Ajouter un utilisateur
                        </button>
                        <button className="md:hidden rounded-md border p-2 flex items-center justify-center gap-1 bg-blue-500 text-white hover:bg-blue-600 hover:cursor-pointer">
                            <UserPlusIcon className="w-5" />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Loader */}
            {isLoading && (
                <SearchLoader/>
            )}
            
            <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
                {/* TABLE */}
                <div className="inline-block min-w-full align-middle">
                    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                        {/* Mobile */}
                        <div className="md:hidden space-y-2">
                            {users?.map((user) => (
                            <div
                                key={user._id}
                                className="rounded-md bg-white p-4 shadow-sm"
                            >
                                <div className="flex justify-between items-start border-b pb-4">
                                <div>
                                    <p className="text-base font-semibold">{user.prenom} {user.nom}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                                <UserStatus status={user.status} />
                                </div>
                                <div className="flex items-center justify-between pt-4">
                                <p className="text-sm text-gray-700">Rôle : {user.role}</p>
                                <div className="flex gap-2">
                                    <UpdateUser id={user._id} />
                                    <DeleteUser 
                                    id={user._id} 
                                    deleteUser={handleDelete} 
                                    isLoading={deletingUserId === user._id}
                                    />
                                </div>
                                </div>
                            </div>
                            ))}
                        </div>

                        {/* Desktop */}
                        <table className="hidden min-w-full text-gray-900 md:table">
                            <thead className="text-left text-sm font-normal">
                            <tr>
                                <th className="px-4 py-5 font-medium sm:pl-6">Prénom</th>
                                <th className="px-3 py-5 font-medium">Nom</th>
                                <th className="px-3 py-5 font-medium">Email</th>
                                <th className="px-3 py-5 font-medium">Rôle</th>
                                <th className="px-3 py-5 font-medium">Statut</th>
                                <th className="py-5 pl-6 pr-3 text-right">
                                <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white">
                            {users?.map((user) => (
                                <tr
                                key={user._id}
                                className="border-b text-sm last:border-none"
                                >
                                <td className="whitespace-nowrap py-4 pl-6 pr-3">{user.prenom}</td>
                                <td className="whitespace-nowrap px-3 py-4">{user.nom}</td>
                                <td className="whitespace-nowrap px-3 py-4">{user.email}</td>
                                <td className="whitespace-nowrap px-3 py-4">{user.role}</td>
                                <td className="whitespace-nowrap px-3 py-4">
                                    <UserStatus status={user.status} />
                                </td>
                                <td className="whitespace-nowrap py-4 pl-6 pr-3 text-right">
                                    <div className="flex justify-end gap-2">
                                    <UpdateUser id={user._id} />
                                    <DeleteUser 
                                    id={user._id} 
                                    deleteUser={handleDelete} 
                                    isLoading={deletingUserId === user._id}
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

            {/* PAGINATION */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
        </>
    );
}

export default UserTable;
