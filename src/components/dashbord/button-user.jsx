"use client"

import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import Link from "next/link"

export function UpdateUser({ id }) {
    return (
      <Link
        href={`/dashboard/users/${id}/edit`}
        className="rounded-md border p-2 hover:bg-gray-100"
      >
        <PencilIcon className="w-5" />
      </Link>
    )
  }
  
  export function DeleteUser({ id, deleteUser, isLoading }) {
    return (
      <button
        type="button" 
        className={clsx(
          "rounded-md border p-2 flex items-center justify-center gap-1 hover:cursor-pointer",
          { "opacity-50 cursor-not-allowed": isLoading }
        )}
        onClick={() => deleteUser(id)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin text-gray-600" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="sr-only">Suppression...</span>
          </>
        ) : (
          <>
            <span className="sr-only">Supprimer</span>
            <TrashIcon className="w-5" />
          </>
        )}
      </button>
    )
  }
  
  
  export function UserStatus({ status }) {
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-full px-2 py-1 text-xs',
          {
            'bg-green-500 text-white': status === 'actif',
            'bg-red-500 text-white': status === 'suspendu',
          },
        )}
      >
        {status === 'actif' ? 'Actif' : 'Suspendu'}
      </span>
    )
  }
  