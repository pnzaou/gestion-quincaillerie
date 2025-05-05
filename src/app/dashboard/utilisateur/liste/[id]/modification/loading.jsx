export default function Loading() {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="h-6 w-56 bg-gray-300 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
        </div>
  
        <div className="flex w-full items-center justify-center p-6 md:p-2">
          <div className="w-full max-w-lg">
            <div className="border rounded-lg shadow-sm p-6 space-y-6">
              {/* Title */}
              <div className="h-5 w-2/3 bg-gray-300 rounded" />
  
              {/* Nom & Prénom */}
              <div className="flex gap-4">
                <div className="w-1/2 space-y-2">
                  <div className="h-4 w-20 bg-gray-300 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
                <div className="w-1/2 space-y-2">
                  <div className="h-4 w-24 bg-gray-300 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
  
              {/* Email & Mot de passe */}
              <div className="flex gap-4">
                <div className="w-1/2 space-y-2">
                  <div className="h-4 w-20 bg-gray-300 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
                <div className="w-1/2 space-y-2">
                  <div className="h-4 w-28 bg-gray-300 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
  
              {/* Rôle */}
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-300 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
  
              {/* Bouton */}
              <div className="h-10 w-full bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  