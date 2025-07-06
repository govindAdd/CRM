import React, { useState, useRef, useEffect, Fragment } from "react";
import { PiUsersThreeBold } from "react-icons/pi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  FiEdit2,
  FiTrash2,
  FiType,
  FiHash,
  FiAlignLeft,
} from "react-icons/fi";
import { Dialog, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useDeleteDepartment } from "../../hooks/department/useDeleteDepartment";
import { useUpdateDepartment } from "../../hooks/department/useUpdateDepartment";

const DepartmentCard = ({ department, onEdit }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const menuRef = useRef();

  const [editName, setEditName] = useState(department.name);
  const [editCode, setEditCode] = useState(department.code || "");
  const [editDescription, setEditDescription] = useState(department.description || "");

  const { handleDelete } = useDeleteDepartment();
  const { updateDepartment, loading: updateLoading } = useUpdateDepartment();

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
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
    closeMenu();
  };

  const handleDone = async () => {
    const updatedData = {
      name: editName.trim(),
      code: editCode.trim(),
      description: editDescription.trim(),
    };

    const result = await updateDepartment(department._id, updatedData);

    if (result.meta.requestStatus === "fulfilled") {
      onEdit?.(result.payload); // optional: notify parent
      setEditModalOpen(false);
    }
  };

  return (
    <>
      <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl hover:border-purple-200 transition-transform duration-300 hover:scale-[1.02]">
        {/* ⋮ Menu */}
        <div className="absolute top-4 right-4 z-20" ref={menuRef}>
          <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-800 p-1">
            <BsThreeDotsVertical className="text-xl" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50"
              >
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiEdit2 className="text-base" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this department?")) {
                      handleDelete(department._id);
                    }
                    closeMenu();
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FiTrash2 className="text-base" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-100 via-purple-50 to-white rounded-full shadow-sm">
            <HiOutlineBuildingOffice2 className="text-xl text-gray-900" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-800 uppercase tracking-wide">
            {department.name}
          </h2>
        </div>

        {/* Code */}
        {department.code && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FiHash className="text-purple-500" />
            <span className="font-medium">{department.code}</span>
          </div>
        )}

        {/* Description */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
          <FiAlignLeft className="text-purple-500 mt-0.5" />
          <span>{department.description || "No description provided."}</span>
        </div>

        {/* Members */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <PiUsersThreeBold className="text-lg text-purple-600" />
          <span className="font-medium">{department.members?.length || 0} Members</span>
        </div>
      </div>

      {/* 🧾 Edit Modal */}
      <Transition appear show={editModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEditModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-xl transition-all">
                  {/* ✖ Close */}
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                  >
                    <IoClose className="text-2xl" />
                  </button>

                  <Dialog.Title className="text-lg font-bold text-purple-700 mb-4 text-center">
                    Edit Department
                  </Dialog.Title>

                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FiHash className="text-purple-500" />
                        Department Code
                      </label>
                      <input
                        type="text"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FiType className="text-purple-500" />
                        Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <FiAlignLeft className="text-purple-500" />
                        Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={4}
                        className="w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditModalOpen(false)}
                        className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDone}
                        disabled={updateLoading}
                        className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateLoading ? "Updating..." : "Done"}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default DepartmentCard;
