import React, { useState, useEffect } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useFetchEmployeesInDepartment } from "../../hooks/department/useEmployeesInDepartment";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const DepartmentEmployees = ({ departmentId }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("fullName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const {
    employees = [],
    departmentMeta,
    empStatus,
    empError,
    total,
    currentPage,
  } = useFetchEmployeesInDepartment({
    departmentId,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  useEffect(() => {
    if (empError) toast.error(empError);
  }, [empError]);

  const toggleMenu = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">
        Employees in {departmentMeta?.name} ({departmentMeta?.code})
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded-md w-full sm:w-64 focus:outline-none border border-purple-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 text-white px-3 py-2 rounded-md border border-purple-500"
        >
          <option value="fullName">Full Name</option>
          <option value="email">Email</option>
          <option value="username">Username</option>
          <option value="createdAt">Created At</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-gray-800 text-white px-3 py-2 rounded-md border border-purple-500"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="bg-gray-800 text-white px-3 py-2 rounded-md border border-purple-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full bg-gray-900 text-white">
          <thead className="bg-purple-800 text-left">
            <tr>
              <th className="p-3">Avatar</th>
              <th className="p-3">Full Name</th>
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Designation</th>
              <th className="p-3">Status</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {empStatus === "loading" ? (
              [...Array(limit)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-3 col-span-10" colSpan={10}>
                    <div className="h-6 bg-gray-700 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center p-6 text-gray-400">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp, idx) => (
                <tr key={emp.userId} className="hover:bg-gray-800 transition">
                  <td className="p-3">
                    <img
                      src={emp.avatar}
                      alt={emp.fullName}
                      className="w-10 h-10 rounded-full border border-purple-500"
                    />
                  </td>
                  <td className="p-3">{emp.fullName}</td>
                  <td className="p-3">{emp.username}</td>
                  <td className="p-3">{emp.email}</td>
                  <td className="p-3">{emp.phone}</td>
                  <td className="p-3">
                    <span className="bg-purple-600 text-sm px-2 py-1 rounded-full uppercase">
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-3">{emp.designation}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        emp.isActive ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(emp.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="relative p-3">
                    <button
                      onClick={() => toggleMenu(idx)}
                      className="hover:text-purple-400"
                    >
                      <FiMoreVertical size={20} />
                    </button>
                    {activeMenu === idx && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 mt-2 w-40 bg-gray-800 border border-purple-500 rounded shadow-lg z-10"
                      >
                        <ul className="text-sm text-white">
                          <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">View Profile</li>
                          <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Edit</li>
                          <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-red-400">Deactivate</li>
                        </ul>
                      </motion.div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="flex items-center gap-1 bg-purple-700 px-4 py-2 rounded hover:bg-purple-800 disabled:opacity-50"
        >
          <FaChevronLeft />
          Previous
        </button>
        <span className="text-lg text-purple-300">
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page * limit >= total}
          className="flex items-center gap-1 bg-purple-700 px-4 py-2 rounded hover:bg-purple-800 disabled:opacity-50"
        >
          Next <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default DepartmentEmployees;
