"use client"

import Link from "next/link";


const Pagination = ({page, totalPages, search}) => {

    function getPaginationRange(current, total) {
        if (total <= 1) return [1]
        
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
            {getPaginationRange(page, totalPages).map((item, index) => {
                if(item === "...") {
                return (
                    <span key={index} className="px-3 py-1 text-gray-500">
                        ...
                    </span>
                    );
                }

                const href = `?page=${item}${search ? `&search=${search}` : ""}`;

                return (
                    <Link
                    key={index}
                    href={href}
                    className={`px-3 py-1 border rounded-md ${
                        page === item ? "bg-blue-600 text-white" : "bg-white text-gray-800"
                        }`}
                    >
                    {item}
                    </Link>
                );
            })}
        </div>
    );
}

export default Pagination;


