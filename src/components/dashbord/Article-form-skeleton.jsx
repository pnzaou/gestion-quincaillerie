

const ArticleFormSkeleton = () => {
    return (
        <div className="animate-pulse flex flex-col gap-6 p-6 md:p-2">
        <div className="w-full max-w-lg mx-auto border rounded-lg shadow-sm p-6 space-y-6">
          {/* Titre */}
          <div className="h-6 w-1/3 bg-gray-300 rounded" />
  
          {/* Nom & Catégorie */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 bg-gray-300 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-300 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          </div>
  
          {/* Prix Achat (Gros) & Prix Vente (Gros) */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 bg-gray-300 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-300 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          </div>
  
          {/* Prix Achat (Détail) & Prix Vente (Détail) */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 bg-gray-300 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-300 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          </div>
  
          {/* Bouton Continuer */}
          <div className="flex justify-end">
            <div className="h-10 w-32 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    );
}

export default ArticleFormSkeleton;
