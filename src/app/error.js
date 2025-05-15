'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center p-6">
      <h1 className="text-4xl font-bold text-red-600">Erreur</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">
        Quelque chose s&apos;est mal passé !
      </h2>
      <p className="mt-2 text-gray-600">
        Une erreur est survenue lors du chargement des données ou du traitement.
      </p>

      <button
        onClick={reset}
        className="mt-6 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
      >
        Réessayer
      </button>
    </div>
  )
}
