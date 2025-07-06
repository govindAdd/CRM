import React from "react";
import { FiPlusCircle } from "react-icons/fi";
import useCreateDepartment from "../../hooks/department/useCreateDepartment";
import DepartmentForm from "./DepartmentForm";

const CreateDepartment = ({ onSuccess }) => {
  const { handleCreateDepartment, createStatus } = useCreateDepartment();

  const handleSubmit = async (formData) => {
    const result = await handleCreateDepartment(formData);
    if (result.success && typeof onSuccess === "function") onSuccess();
  };

  return (
    <div className="w-full text-gray-800">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-200 to-cyan-100 text-black rounded-full shadow">
          <FiPlusCircle className="text-2xl" />
        </div>
        <h2 className="text-2xl font-bold tracking-wide text-gray-800">
          Create New Department
        </h2>
      </div>

      {/* Form Wrapper */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <DepartmentForm
          onSubmit={handleSubmit}
          isLoading={createStatus === "loading"}
        />
      </div>
    </div>
  );
};

export default CreateDepartment;
