import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, setPage, hasNextPage, loading }) => {
  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (hasNextPage) setPage(page + 1);
  };

  return (
    <div className="flex justify-center items-center gap-6 mt-6">
      <button
        onClick={handlePrevious}
        disabled={page === 1 || loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition duration-200
          ${
            page === 1 || loading
              ? "bg-neutral-200 text-gray-400 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500"
              : "bg-white hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-white border-gray-300 dark:border-neutral-600"
          }`}
      >
        <ChevronLeft size={18} />
        Previous
      </button>

      <span className="text-sm font-medium text-gray-800 dark:text-white">
        Page {page}
      </span>

      <button
        onClick={handleNext}
        disabled={!hasNextPage || loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition duration-200
          ${
            !hasNextPage || loading
              ? "bg-neutral-200 text-gray-400 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500"
              : "bg-white hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-white border-gray-300 dark:border-neutral-600"
          }`}
      >
        Next
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
