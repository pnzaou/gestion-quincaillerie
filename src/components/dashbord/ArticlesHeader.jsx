"use client"

import CategoryFilter from "./Category-filter";
import PageSizeSelect from "./Page-size-select";

const ArticlesHeader = ({ searchTerm, onSearchChange, limit, setLimit, setPage, selected, toggleCategory }) => {
    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1/2">
            <input
                type="text"
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Rechercher par nom, par ref (min. 3 caractères)"
                className="w-full md:w-1/2 px-4 py-2 border rounded-md"
            />
            </div>
            <div className="hidden md:flex items-center gap-4">
            <PageSizeSelect limit={limit} setLimit={setLimit} setPage={setPage} />
            <CategoryFilter selected={selected} toggleCategory={toggleCategory} />
            </div>
        </div>
    );
}

export default ArticlesHeader;
