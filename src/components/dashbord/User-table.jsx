"use client";

import {
  DeleteUser,
  UpdateUser,
  UserStatus,
} from "@/components/dashbord/button-user";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import Pagination from "./Pagination";
import Link from "next/link";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import SearchLoader from "./Search-loader";

const UserTable = ({
  initialUsers,
  initialTotalPages,
  currentPage,
  search,
}) => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

    const activeSearch = debouncedSearch;

    setIsLoading(true);
    fetch(`/api/user?page=${page}&limit=5&search=${activeSearch}`)
      .then((response) => response.json())
      .then(({ data, totalPages: tp, currentPage: cp }) => {
        setUsers(data);
        setTotalPages(tp);
        setPage(cp);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Une erreur s'est produite! Veuillez réessayer.");
      })
      .finally(() => setIsLoading(false));
  }, [page, debouncedSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (page !== 1) {
      setPage(1);
    }
  };

  const handleDelete = async (id) => {
    setDeletingUserId(id);
    try {
      const response = await fetch(`/api/user/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setUsers((prev) => prev.filter((user) => user._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur s'est produite ! Veuillez réessayer.");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche et bouton ajouter */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Rechercher par nom ou prénom (min. 3 caractères)"
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Link href="/utilisateur/creer" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2">
            <UserPlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Ajouter un utilisateur</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </Link>
      </div>

      {/* Loader */}
      {isLoading && <SearchLoader />}

      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        {/* TABLE */}
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0 shadow-sm">
            {/* Empty state */}
            {users.length === 0 && !isLoading && (
              <div className="text-center py-12 bg-white rounded-lg">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Aucun utilisateur trouvé
                </p>
              </div>
            )}

            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {users?.map((user) => (
                <div
                  key={user._id}
                  className="rounded-lg bg-white p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start border-b pb-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <UserStatus status={user.status} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">Rôle :</span>
                      <span className="text-sm font-medium text-gray-900">
                        {user.role}
                      </span>
                    </div>
                    {user.role === "gerant" && user.business && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-600">
                          Boutique :
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                          {user.business.name}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 justify-end pt-3 border-t">
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
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-gray-900 bg-white rounded-lg">
                <thead className="text-left text-sm font-normal bg-gray-50">
                  <tr>
                    <th className="px-4 py-5 font-medium">Prénom</th>
                    <th className="px-3 py-5 font-medium">Nom</th>
                    <th className="px-3 py-5 font-medium">Email</th>
                    <th className="px-3 py-5 font-medium">Rôle</th>
                    <th className="px-3 py-5 font-medium">Boutique</th>
                    <th className="px-3 py-5 font-medium">Statut</th>
                    <th className="py-5 pl-6 pr-3 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users?.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 font-medium">
                        {user.prenom}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {user.nom}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {user.role === "gerant" && user.business ? (
                          <span className="text-sm">{user.business.name}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <UserStatus status={user.status} />
                      </td>
                      <td className="whitespace-nowrap py-4 pl-6 pr-3">
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
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default UserTable;
