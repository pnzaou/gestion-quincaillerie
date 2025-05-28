"use client"

import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import Link from "next/link"
import ConfirmDialog from "./ConfirmDialog"
import { Button } from "../ui/button"

export function DetailsArticle({ id }) {
    return (
      <Link
        href={`/dashboard/article/stock/${id}/détails`}
        className="rounded-md border p-2 hover:bg-gray-100"
      >
        <EyeIcon className="w-5" />
      </Link>
    )
}

export function UpdateArticle({ id }) {
    return (
      <Link
        href={`/dashboard/article/stock/${id}/modification`}
        className="rounded-md border p-2 hover:bg-gray-100"
      >
        <PencilIcon className="w-5" />
      </Link>
    )
}
  
  export function DeleteArticle({ id, open, onOpenChange, onConfirm, loading }) {

    return (
      <>
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => onOpenChange(id)}
          className={clsx("rounded-md border p-2 flex items-center justify-center", {
            'opacity-50 cursor-not-allowed': loading
          })}
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin text-gray-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
            </svg>
          ) : (
            <TrashIcon className="w-5" />
          )}
        </Button>

        {/* La modale de confirmation */}
        <ConfirmDialog
          open={open}
          onOpenChange={(isOpen) => onOpenChange(isOpen ? id : null)}
          title="Confirmation de suppression"
          description="Cette action est irréversible. Voulez-vous vraiment supprimer cet articles ?"
          onConfirm={() => onConfirm(id)}
          loading={loading}
        />
      </>
    )
  }
  
  