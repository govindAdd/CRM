import React, { useEffect, useRef } from "react";
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black focus:outline-none"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <h2 id="modal-title" className="text-xl font-bold mb-6 text-gray-800">
              {isEdit ? "Edit Employee Record" : "Create New Employee Record"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employee (Name or ID)
                </label>
                <input
                  type="text"
                  value={formValues.employee || ""}
                  onChange={(e) =>
                    setFormValues({ ...formValues, employee: e.target.value })
                  }
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:ring focus:ring-indigo-200"
                  placeholder="e.g. 123456 or John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Onboarding Status
                </label>
                <select
                  value={formValues.onboardingStatus || ""}
                  onChange={(e) =>
                    setFormValues({ ...formValues, onboardingStatus: e.target.value })
                  }
                  className="w-full px-4 py-2 mt-1 border rounded-md"
                >
                  <option value="">Select status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Resignation Status
                </label>
                <select
                  value={formValues.resignationStatus || ""}
                  onChange={(e) =>
                    setFormValues({ ...formValues, resignationStatus: e.target.value })
                  }
                  className="w-full px-4 py-2 mt-1 border rounded-md"
                >
                  <option value="">Select status</option>
                  <option value="none">None</option>
                  <option value="resigned">Resigned</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notice Period
                </label>
                <input
                  type="text"
                  value={formValues.noticePeriod || ""}
                  onChange={(e) =>
                    setFormValues({ ...formValues, noticePeriod: e.target.value })
                  }
                  className="w-full px-4 py-2 mt-1 border rounded-md"
                  placeholder="e.g. 2 months"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-black">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className={`${
                  loading ? "bg-green-400" : "bg-green-600"
                } text-white hover:bg-green-700`}
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
