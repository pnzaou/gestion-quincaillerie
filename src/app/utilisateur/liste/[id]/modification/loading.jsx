export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="max-w-2xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 sm:h-10 w-48 bg-gray-300 rounded mb-2" />
          <div className="h-4 sm:h-5 w-56 bg-gray-200 rounded" />
        </div>

        {/* Card skeleton */}
        <div className="border rounded-lg shadow-sm bg-white">
          {/* Card header */}
          <div className="p-6 border-b">
            <div className="h-6 w-48 bg-gray-300 rounded" />
          </div>

          {/* Card content */}
          <div className="p-6 space-y-4">
            {/* Ligne 1 - Nom & Prénom */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 bg-gray-300 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 bg-gray-300 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Ligne 2 - Email & Mot de passe */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 bg-gray-300 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-gray-300 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Ligne 3 - Rôle */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-300 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>

            {/* Bouton submit */}
            <div className="pt-2">
              <div className="h-10 w-full bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}