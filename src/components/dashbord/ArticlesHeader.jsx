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
    <div className="flex gap-5 justify-between items-center">
      {/* Conteneur recherche qui grandit */}
      <div className="flex items-center gap-2 flex-1">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par nom, par ref (min. 3 caractères)"
          className="flex-1 px-4 py-2 border rounded-md"
        />
      </div>
      {/* Pilier droit fixe */}
      <div className="hidden lg:flex items-center gap-5">
        <PageSizeSelect
          limit={limit}
          setLimit={setLimit}
          setPage={setPage}
          tabSize={tabSize}
        />
        <CategoryFilter selected={selected} toggleCategory={toggleCategory} />
      </div>
    </div>
  );
};

export default ArticlesHeader;
