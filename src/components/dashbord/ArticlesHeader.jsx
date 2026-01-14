"use client";

import CategoryFilter from "./Category-filter";
import PageSizeSelect from "./Page-size-select";

const ArticlesHeader = ({
  searchTerm,
  onSearchChange,
  limit,
  setLimit,
  setPage,
  selected,
  toggleCategory,
  tabSize,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Barre de recherche - toujours en haut */}
      <div className="w-full">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par nom, par ref (min. 3 caractères)"
          className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Filtres - responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="w-full sm:w-auto">
          <PageSizeSelect
            limit={limit}
            setLimit={setLimit}
            setPage={setPage}
            tabSize={tabSize}
          />
        </div>
        
        <div className="w-full sm:w-auto md:ml-auto">
          <CategoryFilter 
            selected={selected} 
            toggleCategory={toggleCategory} 
          />
        </div>
      </div>
    </div>
  );
};

export default ArticlesHeader;