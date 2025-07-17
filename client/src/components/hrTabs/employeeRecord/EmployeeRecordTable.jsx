import React from "react";
import Tippy from "@tippyjs/react";
import { Trash2, Undo2, Pencil } from "lucide-react";
import "tippy.js/dist/tippy.css";

const EmployeeRecordTable = ({
  records = [],
  selected = [],
  loading,
  toggleSelect,
  handleModalOpen,
  handleDelete,
  handleRestore,
  updateLoading,
  deleteLoading,
  restoreLoading,
}) => {
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-400">
        No records found.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {records.map((rec, index) => (
        <div
          key={rec._id}
          className="relative border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition"
        >
          {/* Top-right Status on small screen */}
          <div className="absolute top-2 right-3 text-xs font-medium sm:hidden">
            {rec.isDeleted ? (
              <span className="text-red-600 dark:text-red-400">Deleted</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">Active</span>
            )}
          </div>

          {/* Avatar + Name */}
          <div className="flex flex-row items-center gap-2 flex-1 min-w-0">
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={selected.includes(rec._id)}
                onChange={() => toggleSelect(rec._id)}
                className="hidden peer"
              />
              <span className="w-5 h-5 border rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center text-xs text-gray-700 dark:text-white">
                {index + 1}
              </span>
            </label>

            {rec?.employee?.avatar ? (
              <img
                src={rec.employee.avatar}
                alt={rec.employee.username}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-xs uppercase shrink-0">
                {rec?.employee?.username?.charAt(0) || "?"}
              </div>
            )}

            <div className="truncate">
              <Tippy
                content={
                  rec?.employee?.email || rec?.employee?.username || "Unknown"
                }
              >
                <span
                  className="font-medium text-xs text-gray-900 dark:text-white block truncate cursor-pointer max-w-[50vw] sm:max-w-[180px]"
                  onDoubleClick={() => {
                    const email =
                      rec?.employee?.email || rec?.employee?.username;
                    if (email) navigator.clipboard.writeText(email);
                  }}
                >
                  {rec?.employee?.username || rec?.employee?.email || "N/A"}
                </span>
              </Tippy>
            </div>
          </div>
          {/* Status on large screens */}
          <div className="hidden sm:block text-xs font-medium text-center shrink-0 sm:w-20 text-nowrap">
            {rec.isDeleted ? (
              <span className="text-red-600 dark:text-red-400">Deleted</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">Active</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-1.5 sm:justify-end shrink-0 w-full sm:w-auto">
            <Tippy content="Edit">
              <button
                onClick={() => handleModalOpen(rec)}
                disabled={updateLoading}
                className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
              >
                <Pencil size={14} />
              </button>
            </Tippy>

            {rec.isDeleted ? (
              <Tippy content="Restore">
                <button
                  onClick={() => handleRestore(rec._id)}
                  disabled={restoreLoading}
                  className="p-1.5 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white transition disabled:opacity-50"
                >
                  <Undo2 size={14} />
                </button>
              </Tippy>
            ) : (
              <Tippy content="Delete">
                <button
                  onClick={() => handleDelete(rec._id)}
                  disabled={deleteLoading}
                  className="p-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </Tippy>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeRecordTable;