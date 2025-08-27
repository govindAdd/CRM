import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { IoClose } from "react-icons/io5";
import { FiType, FiHash, FiAlignLeft } from "react-icons/fi";

const EditDepartmentModal = ({ isOpen, onClose, department, onSave, loading }) => {
  const [editName, setEditName] = useState(department?.name || "");
  const [editCode, setEditCode] = useState(department?.code || "");
  const [editDescription, setEditDescription] = useState(department?.description || "");

  useEffect(() => {
    if (isOpen) {
      setEditName(department?.name || "");
      setEditCode(department?.code || "");
      setEditDescription(department?.description || "");
    }
  }, [isOpen, department]);

  const handleSubmit = () => {
    onSave({
      name: editName.trim(),
      code: editCode.trim(),
      description: editDescription.trim(),
    });
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
              <Dialog.Panel className="relative w-full max-w-md sm:max-w-lg transform overflow-hidden rounded-2xl border border-purple-200 bg-white dark:bg-gray-900 dark:border-gray-700 p-6 shadow-xl transition-all">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <IoClose className="text-2xl" />
                </button>

                {/* Title */}
                <Dialog.Title className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-6 text-center tracking-wide uppercase">
                  Edit Department
                </Dialog.Title>

                {/* Form Fields */}
                <div className="space-y-5">
                  {/* Department Code */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      <FiHash className="text-purple-500" />
                      Department Code
                    </label>
                    <input
                      type="text"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400"
                      placeholder="e.g. HR01"
                    />
                  </div>

                  {/* Department Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      <FiType className="text-purple-500" />
                      Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400"
                      placeholder="e.g. Human Resources"
                    />
                  </div>

                  {/* Department Description */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      <FiAlignLeft className="text-purple-500" />
                      Description
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="w-full border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 resize-none"
                      placeholder="Brief description about the department..."
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Updating..." : "Done"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditDepartmentModal;
