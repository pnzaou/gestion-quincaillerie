"use client"

import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import Link from "next/link"
import { Button } from "../ui/button"
import ConfirmDialog from "./ConfirmDialog"

export function DetailsSale({ id }) {
    return (
      <Link
        href={`/dashboard/vente/historique-vente/${id}/détails`}
        className="rounded-md border p-2 hover:bg-gray-100"
      >
        <EyeIcon className="w-5" />
      </Link>
    )
}

export function UpdateSale({ id }) {
    return (
      <Link
        href={`/dashboard/vente/historique-vente/${id}/détails`}
        className="rounded-md border p-2 hover:bg-gray-100"
      >
        <PencilIcon className="w-5" />
      </Link>
    )
}

export function DeleteSale({ id, open, onOpenChange, onConfirm, loading }) {

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
          description="La suppression d'une catégorie entraînera celle de tous ses produits associés. Êtes-vous sûr de vouloir continuer ?"
          onConfirm={() => onConfirm(id)}
          loading={loading}
        />
      </>
    )
}
  
  