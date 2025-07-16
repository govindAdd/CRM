import React from "react";

const Pagination = ({
  page,
  setPage,
  hasNextPage,
  loading,
}) => {
  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (hasNextPage) setPage(page + 1);
  };

  return (
    <div className="flex justify-center gap-4 mt-4 items-center">
      <button
        onClick={handlePrevious}
        disabled={page === 1 || loading}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-sm text-gray-700">
        Page {page}
      </span>

      <button
        onClick={handleNext}
        disabled={!hasNextPage || loading}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
