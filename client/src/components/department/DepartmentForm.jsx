import React, { useState, useEffect, useRef } from "react";
import { FiCpu, FiCode, FiMessageSquare } from "react-icons/fi";

const DepartmentForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });
  const nameInputRef = useRef();

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 w-full max-w-2xl text-gray-800"
    >
      {/* Department Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold mb-1 tracking-wide text-gray-700">
          Department Name
        </label>
        <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm">
          <FiCpu className="text-purple-700 text-lg" />
          <input
            type="text"
            name="name"
            id="name"
            ref={nameInputRef}
            required
            value={formData.name}
            onChange={handleChange}
            className="flex-1 bg-transparent placeholder:text-gray-400 text-sm outline-none"
            placeholder="e.g. Research & Development"
          />
        </div>
      </div>

      {/* Department Code */}
      <div>
        <label htmlFor="code" className="block text-sm font-semibold mb-1 tracking-wide text-gray-700">
          Department Code
        </label>
        <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm">
          <FiCode className="text-purple-700 text-lg" />
          <input
            type="text"
            name="code"
            id="code"
            required
            value={formData.code}
            onChange={handleChange}
            className="flex-1 bg-transparent uppercase placeholder:text-gray-400 text-sm outline-none"
            placeholder="e.g. RND"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold mb-1 tracking-wide text-gray-700">
          Description
        </label>
        <div className="flex items-start gap-3 bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm">
          <FiMessageSquare className="text-purple-700 mt-1 text-lg" />
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="flex-1 bg-transparent resize-none placeholder:text-gray-400 text-sm outline-none"
            placeholder="Describe the department’s responsibilities..."
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-400 hover:opacity-90 transition-all shadow-lg disabled:opacity-40"
      >
        {isLoading ? "Creating..." : "Create Department"}
      </button>
    </form>
  );
};

export default DepartmentForm;
