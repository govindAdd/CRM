import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiX, FiSearch, FiUserPlus } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";

const MembersModal = ({ isOpen, onClose, title, employees, status, error }) => {
  const [searchTerm, setSearchTerm] = useState("");

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

  // 🔍 Filtered employees based on search term
  const filteredEmployees = employees?.filter((emp) =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[80vh]">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <Dialog.Title className="text-xl font-semibold text-purple-700">
              {title || "Members"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Search + Add button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Search */}
            <div className="flex items-center w-full sm:max-w-sm border border-gray-300 rounded-xl px-4 py-2 bg-white shadow-sm">
              <FiSearch className="text-gray-400 mr-2 text-lg" />
              <input
                type="text"
                placeholder={`Search ${title}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-sm bg-transparent placeholder-gray-400 text-gray-800 outline-none"
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
            <p className="text-red-600 text-sm">{error || "Failed to load employees."}</p>
          )}

          {status === "succeeded" && employees?.length === 0 && (
            <p className="text-gray-500 text-sm">No members found in this department.</p>
          )}

          {status === "succeeded" && filteredEmployees?.length === 0 && (
            <p className="text-gray-500 text-sm">No employees match your search.</p>
          )}

          {status === "succeeded" && filteredEmployees?.length > 0 && (
            <div className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.userId}
                  className="flex items-center gap-4 py-3 hover:bg-gray-50 px-2 rounded-lg transition"
                >
                  <img
                    src={emp.avatar}
                    alt={emp.fullName}
                    className="w-10 h-10 rounded-full object-cover border shadow"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{emp.fullName}</p>
                    <p className="text-xs text-gray-500">{emp.email}</p>
                  </div>
                  <div className="text-xs text-purple-700 font-medium uppercase">
                    {emp.role}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MembersModal;
