import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  Undo2,
  RotateCw,
  Download,
  Search,
  X,
} from "lucide-react";
import Tippy from "@tippyjs/react";
import {
  deleteHRRecord,
  restoreHRRecord,
  exportHRData,
} from "./hrService";
import useCreateHRRecord from "../../hooks/hr/employeeRecords/useCreateHRRecord";
import useSearchHRRecords from "../../hooks/hr/employeeRecords/useSearchHRRecords";
import useUpdateHRRecord from "../../hooks/hr/employeeRecords/useUpdateHRRecord";

const Button = forwardRef(({ onClick, className, children, disabled, type = "button" }, ref) => (
  <button
    type={type}
    onClick={onClick}
    className={`px-4 py-2 rounded-md transition duration-200 ${className} ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    }`}
    ref={ref}
    disabled={disabled}
  >
    {children}
  </button>
));

const EmployeeRecords = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selected, setSelected] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [editingId, setEditingId] = useState(null);
  const modalRef = useRef(null);

  const [filters, setFilters] = useState({
    deleted: searchParams.get("deleted") || "",
    onboardingStatus: searchParams.get("onboardingStatus") || "",
    resignationStatus: searchParams.get("resignationStatus") || "",
  });

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const PAGE_SIZE = 10;

  const { handleUpdateHRRecord, loading: updateLoading } = useUpdateHRRecord();
  const { handleCreateHRRecord, loading: createLoading } = useCreateHRRecord();
  const {
    searchResults: records = [],
    handleSearchHRRecords,
    loading,
  } = useSearchHRRecords();

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set("q", searchTerm);
    if (filters.deleted) queryParams.set("deleted", filters.deleted);
    if (filters.onboardingStatus)
      queryParams.set("onboardingStatus", filters.onboardingStatus);
    if (filters.resignationStatus)
      queryParams.set("resignationStatus", filters.resignationStatus);
    queryParams.set("page", page);
    queryParams.set("limit", PAGE_SIZE.toString());

    setSearchParams(queryParams);
    handleSearchHRRecords(queryParams.toString());
  };

  const handleModalOpen = (record = null) => {
    if (record) {
      setEditingId(record._id);
      setFormValues({
        employee: record?.employee?._id || "",
        onboardingStatus: record.onboardingStatus || "",
        resignationStatus: record.resignationStatus || "",
        noticePeriod: record.noticePeriod || "",
      });
    } else {
      setEditingId(null);
      setFormValues({});
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await handleUpdateHRRecord(editingId, formValues);
        toast.success("Record updated");
      } else {
        await handleCreateHRRecord(formValues, null);
        toast.success("Record created");
      }
      setIsModalOpen(false);
      setFormValues({});
      setEditingId(null);
      handleSearch();
    } catch {
      toast.error(editingId ? "Update failed" : "Creation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteHRRecord(id);
      toast.success("Record deleted");
      handleSearch();
    } catch {
      toast.error("Deletion failed");
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreHRRecord(id);
      toast.success("Record restored");
      handleSearch();
    } catch {
      toast.error("Restore failed");
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportHRData();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "employee_records.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(searchParams.toString());
    handleSearchHRRecords(queryParams.toString());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  return (
    <div className="p-4 space-y-6">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input
            type="text"
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filters.deleted}
            onChange={(e) => setFilters({ ...filters, deleted: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Deleted?</option>
            <option value="true">Deleted</option>
            <option value="false">Active</option>
          </select>
          <select
            value={filters.onboardingStatus}
            onChange={(e) => setFilters({ ...filters, onboardingStatus: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Onboarding</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filters.resignationStatus}
            onChange={(e) => setFilters({ ...filters, resignationStatus: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Resignation</option>
            <option value="resigned">Resigned</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Tippy content="Search">
            <Button onClick={handleSearch} className="bg-blue-600 text-white">
              <Search size={18} />
            </Button>
          </Tippy>
          <Tippy content="Create Record">
            <Button
              onClick={() => handleModalOpen(null)}
              className="bg-green-600 text-white"
              disabled={createLoading}
            >
              <Plus size={18} />
            </Button>
          </Tippy>
          <Tippy content="Export to Excel">
            <Button onClick={handleExport} className="bg-gray-200">
              <Download size={18} />
            </Button>
          </Tippy>
          <Tippy content="Refresh">
            <Button onClick={handleSearch} className="bg-gray-200">
              <RotateCw size={18} />
            </Button>
          </Tippy>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No records found.</div>
        ) : (
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
                <tr key={rec._id} className="hover:bg-gray-50 even:bg-gray-50 border-b">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(rec._id)}
                      onChange={() => toggleSelect(rec._id)}
                    />
                  </td>
                  <td className="p-3 font-medium flex items-center gap-2">
                    <Tippy content={rec?.employee?.email || rec?.employee?.username}>
                      <div className="flex items-center gap-2">
                        {rec?.employee?.avatar ? (
                          <img
                            src={rec.employee.avatar}
                            alt={rec.employee.username}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-xs uppercase">
                            {rec?.employee?.username?.charAt(0) || "?"}
                          </span>
                        )}
                        <span>{rec?.employee?.username || rec?.employee?.email || "N/A"}</span>
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
                    <Button
                      onClick={() => handleModalOpen(rec)}
                      className="bg-blue-600 text-white"
                      disabled={updateLoading}
                    >
                      Edit
                    </Button>
                    {rec.isDeleted ? (
                      <Button
                        onClick={() => handleRestore(rec._id)}
                        className="bg-yellow-600 text-white"
                      >
                        <Undo2 size={16} />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDelete(rec._id)}
                        className="bg-red-600 text-white"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-4">
        <Button
          className="bg-gray-200"
          onClick={() => {
            const newPage = Math.max(page - 1, 1);
            setPage(newPage);
            searchParams.set("page", newPage);
            setSearchParams(searchParams);
            handleSearch();
          }}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="self-center">Page {page}</span>
        <Button
          className="bg-gray-200"
          onClick={() => {
            const nextPage = page + 1;
            setPage(nextPage);
            searchParams.set("page", nextPage);
            setSearchParams(searchParams);
            handleSearch();
          }}
          disabled={records.length < PAGE_SIZE}
        >
          Next
        </Button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit HR Record" : "Create HR Record"}
            </h2>
            <input
              type="text"
              placeholder="Employee Name & ID"
              value={formValues.employee || ""}
              onChange={(e) => setFormValues({ ...formValues, employee: e.target.value })}
              className="w-full mb-3 px-4 py-2 border rounded-md"
            />
            <select
              value={formValues.onboardingStatus || ""}
              onChange={(e) => setFormValues({ ...formValues, onboardingStatus: e.target.value })}
              className="w-full mb-3 px-4 py-2 border rounded-md"
            >
              <option value="">Onboarding Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={formValues.resignationStatus || ""}
              onChange={(e) => setFormValues({ ...formValues, resignationStatus: e.target.value })}
              className="w-full mb-3 px-4 py-2 border rounded-md"
            >
              <option value="">Resignation Status</option>
              <option value="none">None</option>
              <option value="resigned">Resigned</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="text"
              placeholder="Notice Period"
              value={formValues.noticePeriod || ""}
              onChange={(e) => setFormValues({ ...formValues, noticePeriod: e.target.value })}
              className="w-full mb-3 px-4 py-2 border rounded-md"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-black">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-green-600 text-white"
                disabled={createLoading || updateLoading}
              >
                {editingId
                  ? updateLoading
                    ? "Updating..."
                    : "Update"
                  : createLoading
                  ? "Creating..."
                  : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRecords;