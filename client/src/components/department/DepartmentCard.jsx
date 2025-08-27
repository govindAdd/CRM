import React, { useState, useRef, useEffect } from "react";
import { FiEdit2, FiTrash2, FiHash, FiAlignLeft } from "react-icons/fi";
import { PiUsersThreeBold } from "react-icons/pi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";

import EditDepartmentModal from "./EditDepartmentModal";
import MembersModal from "./MembersModal";

import { useDeleteDepartment } from "../../hooks/department/useDeleteDepartment";
import { useUpdateDepartment } from "../../hooks/department/useUpdateDepartment";
import { useFetchEmployeesInDepartment } from "../../hooks/department/useEmployeesInDepartment";

const DepartmentCard = ({ department, onEdit }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const menuRef = useRef();

  const [editName, setEditName] = useState(department.name);
  const [editCode, setEditCode] = useState(department.code || "");
  const [editDescription, setEditDescription] = useState(department.description || "");

  const { handleDelete } = useDeleteDepartment();
  const { updateDepartment, loading: updateLoading } = useUpdateDepartment();

  const { employees, empStatus, empError, total } = useFetchEmployeesInDepartment({
    departmentId: department._id,
    autoFetch: true,
    page: 1,
    limit: 10,
  });

  // Handle outside click to close menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditClick = () => {
    setEditName(department.name);
    setEditCode(department.code || "");
    setEditDescription(department.description || "");
    setEditModalOpen(true);
    setMenuOpen(false);
  };

  const handleUpdate = async () => {
    const updatedData = {
      name: editName.trim(),
      code: editCode.trim(),
      description: editDescription.trim(),
    };
    const result = await updateDepartment(department._id, updatedData);
    if (result.meta.requestStatus === "fulfilled") {
      onEdit?.(result.payload);
      setEditModalOpen(false);
    }
  };

  return (
    <>
      <div className="relative w-full sm:max-w-md 
                      bg-white dark:bg-gray-900 
                      border border-gray-100 dark:border-gray-700 
                      rounded-2xl p-6 shadow-md 
                      hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-600 
                      transition-transform duration-300 hover:scale-[1.02]">
        {/* ⋮ Menu */}
        <div className="absolute top-4 right-4 z-20" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1"
          >
            <BsThreeDotsVertical className="text-xl" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-40 
                           bg-white dark:bg-gray-800 
                           border border-gray-200 dark:border-gray-700 
                           rounded-xl shadow-xl py-1 z-50"
              >
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm 
                             text-gray-700 dark:text-gray-200 
                             hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiEdit2 className="text-base" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this department?")) {
                      handleDelete(department._id);
                    }
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm 
                             text-red-600 dark:text-red-400 
                             hover:bg-red-50 dark:hover:bg-red-900/40"
                >
                  <FiTrash2 className="text-base" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Department Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-100 via-purple-50 to-white 
                          dark:from-purple-900 dark:via-purple-800 dark:to-gray-900 
                          rounded-full shadow-sm">
            <HiOutlineBuildingOffice2 className="text-xl text-gray-900 dark:text-gray-100" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100 uppercase tracking-wide break-words">
            {department.name}
          </h2>
        </div>

        {/* Department Code */}
        {department.code && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
            <FiHash className="text-purple-500 dark:text-purple-400" />
            <span className="font-medium break-words">{department.code}</span>
          </div>
        )}

        {/* Department Description */}
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
          <FiAlignLeft className="text-purple-500 dark:text-purple-400 mt-0.5" />
          <span className="break-words">
            {department.description || "No description provided."}
          </span>
        </div>

        {/* Members */}
        <div
          className="flex items-center gap-2 text-sm 
                     text-gray-700 dark:text-gray-200 
                     cursor-pointer hover:text-purple-700 dark:hover:text-purple-400 transition"
          onClick={() => setEmployeeModalOpen(true)}
        >
          <PiUsersThreeBold className="text-lg text-purple-600 dark:text-purple-400" />
          <span className="font-medium">{total || 0} Members</span>
        </div>
      </div>

      {/* Edit Modal */}
      <EditDepartmentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        department={{
          name: editName,
          code: editCode,
          description: editDescription,
        }}
        onSave={handleUpdate}
        loading={updateLoading}
      />

      {/* Members Modal */}
      <MembersModal
        isOpen={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        title={`Members of ${department.name}`}
        employees={employees}
        status={empStatus}
        error={empError}
        departmentId={department._id}
      />
    </>
  );
};

export default DepartmentCard;
