'use client'

import { useRouter } from "next/navigation";

const ResourceNotFound = ({message, backUrl}) => {
    const router = useRouter()

    return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <h1 className="text-6xl font-bold text-gray-500">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">
            Oups, quelque chose s'est mal passé
        </h2>
        <p className="mt-2 text-gray-600">
            {message}
        </p>
        <button
            onClick={() => router.push(backUrl)}
            className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
            Retour à la liste
        </button>
    </div>
    );
}

export default ResourceNotFound;
