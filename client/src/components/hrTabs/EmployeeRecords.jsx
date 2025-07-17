import React, { useState, useEffect, useRef } from "react";
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

import Button from "../ui/Button";

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
    await handleDeleteHRRecord(id, handleSearch);
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
    <div className="p-4 xxs:p-2 xs:p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 font-inter text-gray-900 dark:text-gray-100 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-xl transition-all duration-300">
  {/* Filters & Actions */}
  <div className="flex flex-col xxs:flex-col sm:flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
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

  {/* Records Table */}
  <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md transition overflow-x-auto">
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
  </div>

  {/* Pagination */}
  <div className="flex justify-center sm:justify-end pt-4">
    <Pagination
      page={page}
      setPage={setPage}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      handleSearch={handleSearch}
      hasNextPage={records.length === PAGE_SIZE}
      Button={Button}
    />
  </div>

  {/* Modal */}
  {isModalOpen && (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 xs:p-4">
      <div
        ref={modalRef}
        className="w-full max-w-lg sm:max-w-xl rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xl transition-all p-4 sm:p-6"
      >
        <EmployeeRecordModal
          editingId={editingId}
          setIsModalOpen={setIsModalOpen}
          formValues={formValues}
          setFormValues={setFormValues}
          handleSubmit={handleSubmit}
          createLoading={createLoading}
          updateLoading={updateLoading}
          Button={Button}
        />
      </div>
    </div>
  )}
</div>
  );
};

export default EmployeeRecords;