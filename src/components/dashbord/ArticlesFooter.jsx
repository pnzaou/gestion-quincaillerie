"use client"

import CategoryFilter from "./Category-filter";
import PageSizeSelect from "./Page-size-select";
import Pagination from "./Pagination";

const ArticlesFooter = ({
  limit, 
  setLimit, 
  page, 
  setPage, 
  totalPages, 
  selected, 
  toggleCategory, 
  tabSize
}) => {
  return (
    <div className="mt-6 space-y-4">
      {/* Pagination - toujours centrée */}
      <div className="flex justify-center">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
      
      {/* Contrôles - responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-auto">
          <PageSizeSelect 
            limit={limit} 
            setLimit={setLimit} 
            setPage={setPage} 
            tabSize={tabSize}
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <CategoryFilter 
            selected={selected} 
            toggleCategory={toggleCategory}
          />
        </div>
      </div>
    </div>
  );
}

export default ArticlesFooter;