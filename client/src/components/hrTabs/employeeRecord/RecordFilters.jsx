import React from "react";
import classNames from "classnames";
import { XCircle } from "lucide-react";

const baseInputClass =
  "peer w-full px-3 py-2 pt-5 border rounded-md text-sm bg-white dark:bg-neutral-900 dark:text-white border-gray-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

const baseLabelClass =
  "absolute left-3 top-2 text-xs text-gray-500 dark:text-neutral-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500";

const wrapperClass = "relative w-full md:w-48";

const RecordFilters = ({ filters, setFilters, searchTerm, setSearchTerm }) => {
  const handleFilterChange = (key) => (e) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      deleted: "",
      onboardingStatus: "",
      resignationStatus: "",
    });
  };

  return (
    <div className="flex flex-wrap gap-3 items-end w-full">
      {/* Search Input */}
      <div className="relative w-full md:w-64">
        <input
          id="search"
          type="text"
          placeholder=" "
          className={baseInputClass}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search by name/email/username"
        />
        <label htmlFor="search" className={baseLabelClass}>
          Search by name, email or username
        </label>
      </div>

      {/* Deleted Filter */}
      <div className={wrapperClass}>
        <select
          id="deleted"
          value={filters.deleted}
          onChange={handleFilterChange("deleted")}
          className={baseInputClass}
          aria-label="Deleted filter"
        >
          <option value="" hidden />
          <option value="true">Deleted</option>
          <option value="false">Active</option>
        </select>
        <label htmlFor="deleted" className={baseLabelClass}>
          Deleted?
        </label>
      </div>

      {/* Onboarding Status */}
      <div className={wrapperClass}>
        <select
          id="onboarding"
          value={filters.onboardingStatus}
          onChange={handleFilterChange("onboardingStatus")}
          className={baseInputClass}
          aria-label="Onboarding filter"
        >
          <option value="" hidden />
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <label htmlFor="onboarding" className={baseLabelClass}>
          Onboarding
        </label>
      </div>

      {/* Resignation Status */}
      <div className={wrapperClass}>
        <select
          id="resignation"
          value={filters.resignationStatus}
          onChange={handleFilterChange("resignationStatus")}
          className={baseInputClass}
          aria-label="Resignation filter"
        >
          <option value="" hidden />
          <option value="resigned">Resigned</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <label htmlFor="resignation" className={baseLabelClass}>
          Resignation
        </label>
      </div>

      {/* Clear Filters Button */}
      <button
        type="button"
        onClick={handleClearFilters}
        className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-sm text-gray-700 dark:text-white border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
      >
        <XCircle size={16} />
        Clear
      </button>
    </div>
  );
};

export default RecordFilters;
