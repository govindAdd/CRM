import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";

const Pagination = ({ page, setPage, hasNextPage, loading, handleSearch }) => {
  const handlePrevious = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      handleSearch(newPage);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      const newPage = page + 1;
      setPage(newPage);
      handleSearch(newPage);
    }
  };

  return (
    <div className="flex justify-center items-center gap-4 sm:gap-6 mt-6">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={page === 1 || loading}
        aria-label="Previous page"
        aria-disabled={page === 1 || loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition duration-200
          ${
            page === 1 || loading
              ? "bg-neutral-200 text-gray-400 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500"
              : "bg-white hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-white border-gray-300 dark:border-neutral-600"
          }`}
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Current Page Display */}
      <span className="text-sm font-semibold text-gray-800 dark:text-white select-none">
        Page {page}
      </span>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!hasNextPage || loading}
        aria-label="Next page"
        aria-disabled={!hasNextPage || loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition duration-200
          ${
            !hasNextPage || loading
              ? "bg-neutral-200 text-gray-400 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500"
              : "bg-white hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-white border-gray-300 dark:border-neutral-600"
          }`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  loading: PropTypes.bool,
  handleSearch: PropTypes.func.isRequired,
};

export default Pagination;
