import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiX, FiSearch, FiUserPlus, FiTrash2 } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import useRemoveMemberFromDepartment from "../../hooks/department/useRemoveMemberFromDepartment";

const MembersModal = ({
  isOpen,
  onClose,
  title,
  employees,
  status,
  error,
  departmentId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { handleRemoveMember, removeStatus } = useRemoveMemberFromDepartment();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 🔍 Filtered employees
  const filteredEmployees = employees?.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalEmployees = filteredEmployees?.length || 0;
  const totalPages = Math.ceil(totalEmployees / pageSize);
  const paginatedEmployees = filteredEmployees?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when search changes or modal opens
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[80vh]">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-xl font-semibold text-purple-700 dark:text-purple-400">
              {title || "Members"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Search + Add button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Search */}
            <div className="flex items-center w-full sm:max-w-sm border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 shadow-sm">
              <FiSearch className="text-gray-400 dark:text-gray-500 mr-2 text-lg" />
              <input
                type="text"
                placeholder={`Search ${title}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-sm bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-200 outline-none"
              />
            </div>

            {/* Add Employee Button */}
            <button
              onClick={() => console.log("Add Employee clicked")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition"
            >
              <FiUserPlus className="text-base" />
              Add Employee
            </button>
          </div>

          {/* Status Handling */}
          {status === "loading" && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} height={50} />
              ))}
            </div>
          )}

          {status === "failed" && (
            <p className="text-red-600 text-sm">
              {error || "Failed to load employees."}
            </p>
          )}

          {status === "succeeded" && employees?.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No members found in this department.
            </p>
          )}

          {status === "succeeded" && filteredEmployees?.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No employees match your search.
            </p>
          )}

          {status === "succeeded" && filteredEmployees?.length > 0 && (
            <>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedEmployees.map((emp) => (
                  <div
                    key={emp.userId}
                    className="flex items-center gap-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded-lg transition"
                  >
                    <img
                      src={emp.avatar}
                      alt={emp.fullName}
                      className="w-10 h-10 rounded-full object-cover border shadow"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {emp.fullName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {emp.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-700 dark:text-purple-400 font-medium uppercase">
                        {emp.role}
                      </span>
                      <button
                        onClick={() =>
                          handleRemoveMember({
                            id: departmentId,
                            userId: emp.userId,
                          })
                        }
                        className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-600 transition"
                        title="Remove Member"
                        disabled={removeStatus === "loading"}
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1 ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="text-lg">&#8592;</span> Prev
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`px-3 py-1 rounded-lg border ${
                        currentPage === idx + 1
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                      } transition`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1 ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Next <span className="text-lg">&#8594;</span>
                  </button>
                </div>
              )}
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MembersModal;
