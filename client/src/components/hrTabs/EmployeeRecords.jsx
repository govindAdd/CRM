import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useCreateHRRecord from "../../hooks/hr/employeeRecords/useCreateHRRecord";
import useSearchHRRecords from "../../hooks/hr/employeeRecords/useSearchHRRecords";
import useUpdateHRRecord from "../../hooks/hr/employeeRecords/useUpdateHRRecord";
import useDeleteHRRecord from "../../hooks/hr/employeeRecords/useDeleteHRRecord";
import useRestoreHRRecord from "../../hooks/hr/employeeRecords/useRestoreHRRecord";
import useExportHRData from "../../hooks/hr/employeeRecords/useExportHRData";

import RecordFilters from "../../components/hrTabs/employeeRecord/RecordFilters";
import RecordActions from "../../components/hrTabs/employeeRecord/RecordActions";
import EmployeeRecordTable from "../../components/hrTabs/employeeRecord/EmployeeRecordTable";
import Pagination from "../../components/hrTabs/employeeRecord/Pagination";
import EmployeeRecordModal from "../../components/hrTabs/employeeRecord/EmployeeRecordModal";

const Button = forwardRef(
  ({ onClick, className, children, disabled, type = "button" }, ref) => (
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
  )
);

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
  const { handleDeleteHRRecord, loading: deleteLoading } = useDeleteHRRecord();
  const { handleRestoreHRRecord, loading: restoreLoading } = useRestoreHRRecord();
  const { handleExportHRData, loading: exportLoading } = useExportHRData();

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
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    await handleDeleteHRRecord(id, () => {
      handleSearch();
    });
  };

  const handleRestore = async (id) => {
      if (!window.confirm("Are you sure you want to restore this record?")) return;
      await handleRestoreHRRecord(id);
      handleSearch();
    
  };

  const handleExport = async () => {
    handleExportHRData("excel");
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <RecordFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
        />
        <RecordActions
          handleSearch={handleSearch}
          handleModalOpen={handleModalOpen}
          createLoading={createLoading}
          handleExport={handleExport}
          Button={Button}
          exportLoading={exportLoading}
        />
      </div>

      <EmployeeRecordTable
        loading={loading}
        records={records}
        selected={selected}
        toggleSelect={toggleSelect}
        handleModalOpen={handleModalOpen}
        updateLoading={updateLoading}
        handleDelete={handleDelete}
        handleRestore={handleRestore}
        deleteLoading={deleteLoading}
        restoreLoading={restoreLoading}
      />

      <Pagination
        page={page}
        setPage={setPage}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        handleSearch={handleSearch}
        hasNextPage={records.length === PAGE_SIZE}
      />

      {isModalOpen && (
        <EmployeeRecordModal
          modalRef={modalRef}
          editingId={editingId}
          setIsModalOpen={setIsModalOpen}
          formValues={formValues}
          setFormValues={setFormValues}
          handleSubmit={handleSubmit}
          createLoading={createLoading}
          updateLoading={updateLoading}
          Button={Button}
        />
      )}
    </div>
  );
};

export default EmployeeRecords;
