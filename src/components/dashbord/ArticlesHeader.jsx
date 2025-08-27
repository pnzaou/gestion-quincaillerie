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
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 w-full">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par nom, par ref (min. 3 caractères)"
          className="flex-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <div className="hidden md:flex items-center gap-3">
          <PageSizeSelect
            limit={limit}
            setLimit={setLimit}
            setPage={setPage}
            tabSize={tabSize}
          />
          <CategoryFilter selected={selected} toggleCategory={toggleCategory} />
        </div>

        {/* Small screen condensed controls */}
        <div className="flex md:hidden items-center gap-2 w-full">
          <PageSizeSelect
            limit={limit}
            setLimit={setLimit}
            setPage={setPage}
            tabSize={tabSize}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticlesHeader;
