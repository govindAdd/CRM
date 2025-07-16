import React from "react";
import Tippy from "@tippyjs/react";
import { Trash2, Undo2 } from "lucide-react";
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
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (records.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">No records found.</div>
    );
  }

  return (
    <div className="border rounded-xl overflow-auto">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Department</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr
              key={rec._id}
              className="hover:bg-gray-50 even:bg-gray-50 border-b"
            >
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selected.includes(rec._id)}
                  onChange={() => toggleSelect(rec._id)}
                />
              </td>
              <td className="p-3 font-medium">
                <Tippy
                  content={rec?.employee?.email || rec?.employee?.username}
                >
                  <div className="flex items-center gap-2">
                    {rec?.employee?.avatar ? (
                      <img
                        src={rec.employee.avatar}
                        alt={rec.employee.username}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-xs uppercase">
                        {rec?.employee?.username?.charAt(0) || "?"}
                      </div>
                    )}
                    <span>
                      {rec?.employee?.username || rec?.employee?.email || "N/A"}
                    </span>
                  </div>
                </Tippy>
              </td>
              <td className="p-3">{rec?.employee?.department || "N/A"}</td>
              <td className="p-3">
                {rec.isDeleted ? (
                  <span className="text-red-500">Deleted</span>
                ) : (
                  <span className="text-green-600">Active</span>
                )}
              </td>
              <td className="p-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => handleModalOpen(rec)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  disabled={updateLoading}
                >
                  Edit
                </button>
                {rec.isDeleted ? (
                  <button
                    onClick={() => handleRestore(rec._id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md"
                    disabled={restoreLoading}
                  >
                    <Undo2 size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleDelete(rec._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                    disabled={deleteLoading}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeRecordTable;
