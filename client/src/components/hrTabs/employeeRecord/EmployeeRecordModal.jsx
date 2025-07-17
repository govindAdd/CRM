import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

const EmployeeRecordModal = ({
  isOpen = true,
  modalRef,
  editingId,
  setIsModalOpen,
  formValues,
  setFormValues,
  handleSubmit,
  createLoading,
  updateLoading,
  Button,
}) => {
  const isEdit = !!editingId;
  const loading = isEdit ? updateLoading : createLoading;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef?.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-xl xxs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition"
              aria-label="Close modal"
            >
              <X size={22} />
            </button>

            {/* Title */}
            <h2
              id="modal-title"
              className="text-lg sm:text-xl font-semibold mb-6 text-gray-800 dark:text-white"
            >
              {isEdit ? "Edit Employee Record" : "Create Employee Record"}
            </h2>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Employee Field */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Employee (Name or ID)
                </label>
                <input
                  type="text"
                  value={formValues.employee || ""}
                  onChange={(e) =>
                    setFormValues({ ...formValues, employee: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-neutral-800 text-sm sm:text-base text-gray-800 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. John Doe or 123456"
                />
              </div>

              {/* Onboarding Status */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Onboarding Status
                </label>
                <select
                  value={formValues.onboardingStatus || ""}
                  onChange={(e) =>
                    setFormValues({ ...formValues, onboardingStatus: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-neutral-800 text-sm sm:text-base text-gray-800 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Resignation Status */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Resignation Status
                </label>
                <select
                  value={formValues.resignationStatus || ""}
                  onChange={(e) =>
                    setFormValues({ ...formValues, resignationStatus: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-neutral-800 text-sm sm:text-base text-gray-800 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select status</option>
                  <option value="none">None</option>
                  <option value="resigned">Resigned</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Notice Period */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Notice Period
                </label>
                <input
                  type="text"
                  value={formValues.noticePeriod || ""}
                  onChange={(e) =>
                    setFormValues({ ...formValues, noticePeriod: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-neutral-800 text-sm sm:text-base text-gray-800 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. 2 months"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 dark:bg-neutral-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-neutral-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className={`${
                  loading
                    ? "bg-green-400 dark:bg-green-500"
                    : "bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600"
                } text-white`}
              >
                {loading
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

EmployeeRecordModal.propTypes = {
  isOpen: PropTypes.bool,
  modalRef: PropTypes.object,
  editingId: PropTypes.string,
  setIsModalOpen: PropTypes.func,
  formValues: PropTypes.object,
  setFormValues: PropTypes.func,
  handleSubmit: PropTypes.func,
  createLoading: PropTypes.bool,
  updateLoading: PropTypes.bool,
  Button: PropTypes.elementType.isRequired,
};

export default EmployeeRecordModal;
