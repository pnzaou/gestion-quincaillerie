"use client"

import CategoryFilter from "./Category-filter";
import PageSizeSelect from "./Page-size-select";
import Pagination from "./Pagination";

const ArticlesFooter = ({limit, setLimit, page, setPage, totalPages, selected, toggleCategory, tabSize}) => {
    return (
        <div className="flex flex-col items-center md:flex-row">
          <div className="order-2 md:order-1 flex-1/3 mt-6">
            <PageSizeSelect limit={limit} setLimit={setLimit} setPage={setPage} tabSize={tabSize}/>
          </div>
          <div className="order-1 md:order-2 flex-1/3">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
          <div className="order-3 md:order-3 flex-1/3 flex justify-end mt-6">
            <CategoryFilter selected={selected} toggleCategory={toggleCategory}/>
          </div>
        </div>
    );
}

export default ArticlesFooter;
