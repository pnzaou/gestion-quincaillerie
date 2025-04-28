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
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
        {getPaginationRange(page, totalPages).map((item, idx) => {
            if (item === "...") {
            return (
                <span key={idx} className="px-3 py-1 text-gray-500">
                …
                </span>
            );
            }
            return (
            <button
                key={idx}
                onClick={() => onPageChange(item)}
                className={`px-3 py-1 border rounded-md ${
                page === item ? "bg-blue-600 text-white" : "bg-white text-gray-800"
                }`}
            >
                {item}
            </button>
            );
        })}
        </div>
    );
};

export default Pagination;
