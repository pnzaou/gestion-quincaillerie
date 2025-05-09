
const Loading = () => {
    return (
        <div className="animate-pulse flex flex-col gap-6 p-6 md:p-2">
            {/* Skeleton du titre de la page */}
            <div className="mb-6 space-y-2">
                <div className="h-6 w-1/4 bg-gray-300 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>

            {/* Skeleton du formulaire centré */}
            <div className="w-full max-w-lg mx-auto border rounded-lg shadow-sm p-6 space-y-6">
                {/* Titre du formulaire */}
                <div className="h-6 w-1/3 bg-gray-300 rounded" />

                {/* Nom & Adresse */}
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-20 bg-gray-300 rounded" />
                        <div className="h-10 w-full bg-gray-200 rounded" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-20 bg-gray-300 rounded" />
                        <div className="h-10 w-full bg-gray-200 rounded" />
                    </div>
                </div>

                {/* Téléphone & Email */}
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-28 bg-gray-300 rounded" />
                        <div className="h-10 w-full bg-gray-200 rounded" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-20 bg-gray-300 rounded" />
                        <div className="h-10 w-full bg-gray-200 rounded" />
                    </div>
                </div>

                {/* Bouton */}
                <div className="pt-4">
                    <div className="h-10 w-full bg-gray-300 rounded" />
                </div>
            </div>
        </div>
    );
}

export default Loading;
