import React from "react";

const selectClass =
  "px-3 py-2 border border-gray-300 rounded-md text-sm bg-white";

const RecordFilters = ({ filters, setFilters, searchTerm, setSearchTerm }) => {
  const handleFilterChange = (key) => (e) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
      {/* Search Input */}
      <input
        type="text"
        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md text-sm"
        placeholder="Search by name, email or username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search input"
      />

      {/* Deleted Filter */}
      <select
        value={filters.deleted}
        onChange={handleFilterChange("deleted")}
        className={selectClass}
        aria-label="Deleted filter"
      >
        <option value="">Deleted?</option>
        <option value="true">Deleted</option>
        <option value="false">Active</option>
      </select>

      {/* Onboarding Filter */}
      <select
        value={filters.onboardingStatus}
        onChange={handleFilterChange("onboardingStatus")}
        className={selectClass}
        aria-label="Onboarding status filter"
      >
        <option value="">Onboarding</option>
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      {/* Resignation Filter */}
      <select
        value={filters.resignationStatus}
        onChange={handleFilterChange("resignationStatus")}
        className={selectClass}
        aria-label="Resignation status filter"
      >
        <option value="">Resignation</option>
        <option value="resigned">Resigned</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>
  );
};

export default RecordFilters;
