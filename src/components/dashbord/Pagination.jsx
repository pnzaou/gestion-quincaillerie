"use client";

const Pagination = ({ page, totalPages, onPageChange }) => {

  function getPaginationRange(current, total) {
    if (total <= 1) return [1];
  
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
  
    let left = Math.max(2, current - delta);
    let right = Math.min(total - 1, current + delta);
  
    for (let i = left; i <= right; i++) {
      range.push(i);
    }
  
    if (left > 2) {
      rangeWithDots.push("...");
    }
  
    for (let i of range) {
      rangeWithDots.push(i);
    }
  
    if (right < total - 1) {
      rangeWithDots.push("...");
    }
  
    return [1, ...rangeWithDots, total];
  }

  return (
    <div className="flex justify-center gap-1 sm:gap-2 flex-wrap">
      {getPaginationRange(page, totalPages).map((item, idx) => {
        if (item === "...") {
          return (
            <span key={idx} className="px-2 sm:px-3 py-1 text-gray-500">
              …
            </span>
          );
        }
        return (
          <button
            key={idx}
            onClick={() => onPageChange(item)}
            className={`min-w-[36px] sm:min-w-[40px] px-2 sm:px-3 py-1.5 sm:py-2 border rounded-md transition-colors touch-manipulation ${
              page === item 
                ? "bg-blue-600 text-white border-blue-600" 
                : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"
            }`}
            aria-label={`Page ${item}`}
            aria-current={page === item ? "page" : undefined}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
};

export default Pagination;