"use client";

const Loading = () => {
  function HeaderSkeleton() {
    return (
      <div className="flex items-center justify-between w-full p-4 animate-pulse space-x-4">
        {/* Search bar */}
        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded" />

        {/* PageSizeSelect */}
        <div className="hidden md:block h-10 bg-gray-200 dark:bg-gray-700 rounded w-[180px]" />

        {/* CategoryFilter */}
        <div className="hidden md:block h-10 bg-gray-200 dark:bg-gray-700 rounded w-[200px]" />

        {/* Choisir client */}
        <div className="hidden md:block h-10 bg-gray-200 dark:bg-gray-700 rounded w-[180px]" />

        {/* Panier */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-[120px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Skeleton titre + sous-titre */}
      <div className="p-4 animate-pulse space-y-2">
        {/* Titre principal (ex. “Ventes”) */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-30" />
        {/* Phrase sous-titre (ex. “Effectuer une vente”) */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-50" />
      </div>
      <HeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 16 }).map((item, index) => (
          <div
            className="p-4 border rounded animate-pulse flex flex-col space-y-3"
            key={index}
          >
            {/* Placeholder image */}
            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded" />

            {/* Placeholder titre */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />

            {/* Placeholder prix */}
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />

            {/* Placeholder badge stock */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto" />

            {/* Placeholder boutons + quantité */}
            <div className="flex items-center justify-between mt-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-8" />
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
