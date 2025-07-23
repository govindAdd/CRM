import React, { forwardRef, useState } from "react";
import PropTypes from "prop-types";
import { Loader2, UsersRound, Download, Search } from "lucide-react";
import useGetActiveEmployees from "../../hooks/hr/useGetActiveEmployees";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import * as XLSX from "xlsx";
import debounce from "lodash.debounce";
import Button from "../ui/Button";

Button.displayName = "Button";
Button.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

// ➤ Main Component
function ActiveEmployees({ query = { page: 1, setPage: () => {} } }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debounced = debounce((value) => {
    setDebouncedSearch(value.trim());
    query.setPage(1);
  }, 500);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    debounced(e.target.value);
  };

  const queryString = `page=${query.page}${
    debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""
  }`;

  const {
    records,
    loading,
    error,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    refetch,
  } = useGetActiveEmployees(queryString);
  const handleRefresh = () => refetch();

  const handleExportToExcel = () => {
    if (!records?.length) return;
    const exportData = records.map(({ employee, departments }) => ({
      Name: employee?.fullName || "-",
      Email: employee?.email || "-",
      Department: departments?.[0]?.name || "-",
      Role: employee?.role || "Employee",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Active Employees");
    XLSX.writeFile(workbook, "active-employees.xlsx");
  };

  return (
    <section className="space-y-6">
      {/* ➤ Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
          <UsersRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Active Employees
        </h2>
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search name or Gmail..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-2xl text-sm bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-zinc-400" />
          </div>
          <Tippy content="Export to Excel">
            <Button
              className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white border border-gray-300 dark:border-zinc-700"
              onClick={handleExportToExcel}
              disabled={loading || !records?.length}
            >
              <Download className="w-5 h-5" />
            </Button>
          </Tippy>
          <Tippy content="Refresh">
            <Button
              className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white border border-gray-300 dark:border-zinc-700"
              onClick={handleRefresh}
            >
              <Loader2 className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </Tippy>
        </div>
      </div>

      {/* ➤ Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
        {loading || error || records?.length === 0 ? (
          <div className="p-12 text-center">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                error
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-blue-100 dark:bg-blue-900/30"
              } mb-4`}
            >
              {error ? (
                <UsersRound className="w-6 h-6 text-red-600 dark:text-red-400" />
              ) : (
                <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
              )}
            </div>
            <p
              className={`font-medium ${
                error
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-zinc-400"
              }`}
            >
              {error
                ? "Failed to load employees"
                : "Loading active employees..."}
            </p>
            <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
              {error
                ? "Please try refreshing the page"
                : "Please wait while we fetch the data"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                  {["Employee", "Contact", "Department", "Role"].map(
                    (col, idx) => (
                      <th
                        key={idx}
                        className="px-4 sm:px-6 py-4 text-left whitespace-nowrap"
                      >
                        <div className="flex items-center gap-2">
                          {idx === 0 && (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                          <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                            {col}
                          </span>
                        </div>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {records.map(({ _id, employee, departments }) => (
                  <tr
                    key={_id}
                    className="group hover:bg-blue-50 dark:hover:bg-zinc-800/30 transition duration-150"
                  >
                    {/* Employee */}
                    <td className="px-4 sm:px-6 py-5 min-w-[200px]">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          {employee?.avatar ? (
                            <img
                              src={employee.avatar}
                              alt={employee?.fullName || "Avatar"}
                              className="w-10 h-10 rounded-full object-cover shadow-lg border-2 border-white dark:border-zinc-900"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                              {employee?.fullName?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </div>
                          )}

                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {employee?.fullName || "-"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">
                            ID: {_id?.slice(-6)?.toUpperCase() || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-4 sm:px-6 py-5 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                          <span className="text-gray-600 dark:text-zinc-400 text-xs">
                            @
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {employee?.email || "-"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">
                            {employee?.username || "-"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">
                            ph: {employee?.phone || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Department */}
                    <td className="px-4 sm:px-6 py-5 min-w-[150px]">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate">
                          {departments?.[0]?.name || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-4 sm:px-6 py-5 min-w-[120px]">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300 capitalize truncate">
                          {employee?.role || "Employee"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ➤ Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          <Button
            onClick={() => query.setPage(page - 1)}
            disabled={!hasPrevPage}
            className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white border border-gray-300 dark:border-zinc-700"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => query.setPage(page + 1)}
            disabled={!hasNextPage}
            className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white border border-gray-300 dark:border-zinc-700"
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}

ActiveEmployees.propTypes = {
  query: PropTypes.shape({
    page: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
  }),
};

export default ActiveEmployees;
