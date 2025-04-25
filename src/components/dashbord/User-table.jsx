"use client"

import { DeleteUser, UpdateUser, UserStatus } from "@/components/dashbord/button-user";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { getPaginationRange } from "@/lib/pagination";
import Pagination from "./Pagination";

const UserTable = ({initialUsers, totalPages, currentPage, search}) => {
    const [users, setUsers] = useState(initialUsers)
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams()
    const hasMounted = useRef(false)

    const page = parseInt(currentPage)

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        const pageParam = searchParams.get("page") || "1";
        const searchParam = searchParams.get("search") || "";

        setIsLoading(true)
        fetch(`/api/user?page=${pageParam}&limit=1&search=${searchParam}`)
          .then(response => response.json())
          .then(({ data }) => {
            console.log(data)
            setUsers(data)
        })
         .catch(error => {
            console.error(error)
            toast.error("Une erreur s'est produite! Veuillez réessayer.")
        }).finally(() => {
            setIsLoading(false)
        })
        
    }, [searchParams])
    
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
            {isLoading && (
                <div className="flex justify-center py-4 space-x-2">
                    <div
                    className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                    />
                    <div
                    className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                    />
                    <div
                    className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                    />
                </div>
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
            search={search}
            />
        </>
    );
}

export default UserTable;
