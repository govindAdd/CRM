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
    <div className="rounded-xl overflow-x-auto shadow-md border dark:border-neutral-700">
      <table className="min-w-full table-auto text-sm text-gray-800 dark:text-gray-100">
        <thead className="bg-gray-100 dark:bg-neutral-800 text-left uppercase text-xs font-semibold tracking-wide">
          <tr>
            <th className="px-5 py-3">#</th>
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Department</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec, index) => (
            <tr
              key={rec._id}
              className="border-t border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
            >
              <td className="px-5 py-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(rec._id)}
                    onChange={() => toggleSelect(rec._id)}
                    className="hidden peer"
                  />
                  <span className="w-5 h-5 border rounded peer-checked:bg-blue-300 peer-checked:border-blue-300 flex items-center justify-center text-xs text-gray-800 dark:text-gray-100">
                    {index + 1}
                  </span>
                </label>
              </td>
              <td className="px-5 py-4">
                <Tippy
                  content={
                    rec?.employee?.email || rec?.employee?.username || "Unknown"
                  }
                >
                  <div className="flex items-center gap-3">
                    {rec?.employee?.avatar ? (
                      <img
                        src={rec.employee.avatar}
                        alt={rec.employee.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-neutral-600 flex items-center justify-center text-xs font-semibold text-white uppercase">
                        {rec?.employee?.username?.charAt(0) || "?"}
                      </div>
                    )}
                    <span
                      className="line-clamp-1 cursor-pointer"
                      onDoubleClick={(e) => {
                        const email =
                          rec?.employee?.email || rec?.employee?.username;
                        if (email) {
                          navigator.clipboard.writeText(email);
                        }
                      }}
                      onTouchEnd={(e) => {
                        const now = Date.now();
                        const lastTap = e.target.dataset.lastTap || 0;

                        if (now - lastTap < 400) {
                          const email =
                            rec?.employee?.email || rec?.employee?.username;
                          if (email) {
                            navigator.clipboard.writeText(email);
                          }
                        }

                        e.target.dataset.lastTap = now;
                      }}
                    >
                      {rec?.employee?.username || rec?.employee?.email || "N/A"}
                    </span>
                  </div>
                </Tippy>
              </td>

              <td className="px-5 py-4">
                {rec?.employee?.department || "N/A"}
              </td>

              <td className="px-5 py-4">
                {rec.isDeleted ? (
                  <span className="text-red-500 font-medium">Deleted</span>
                ) : (
                  <span className="text-green-600 font-medium">Active</span>
                )}
              </td>

              <td className="px-5 py-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleModalOpen(rec)}
                    disabled={updateLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  {rec.isDeleted ? (
                    <button
                      onClick={() => handleRestore(rec._id)}
                      disabled={restoreLoading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition disabled:opacity-50"
                    >
                      <Undo2 size={16} />
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(rec._id)}
                      disabled={deleteLoading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeRecordTable;
