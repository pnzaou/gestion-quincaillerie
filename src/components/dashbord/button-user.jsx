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
  
  export function DeleteUser({ id, deleteUser }) {
    return (
      <button
       type="button" 
       className="rounded-md border p-2 hover:bg-gray-100"
       onClick={() => deleteUser(id)}
      >
        <span className="sr-only">Supprimer</span>
        <TrashIcon className="w-5" />
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
            'bg-gray-200 text-gray-500': status === 'suspendu',
          },
        )}
      >
        {status === 'actif' ? 'Actif' : 'Suspendu'}
      </span>
    )
  }
  