import React from "react";
import CheckInOut from "./CheckInOut";
import { CheckCircle, Clock4, ClipboardCheck } from "lucide-react";
import { useAttendanceFormLogic } from "../../hooks/attendance/useAttendanceFormLogic";
import { formatDateTime } from "../../utils/formatDateTime";

const AttendanceForm = () => {
  const {
    formData,
    setFormData,
    handleCameraCapture,
    handleSubmit,
    validationErrors,
    isLoading,
    error,
  } = useAttendanceFormLogic();

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-5xl mx-auto p-6 bg-white/90 dark:bg-gray-800/80 backdrop-blur rounded-3xl shadow-xl space-y-6 transition-colors"
    >
      <h2 className="text-center text-2xl font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider transition-colors">
        Attendance
      </h2>

      <div className="text-sm text-center space-y-2">
        {formData.clockIn && (
          <p className="text-green-700 dark:text-green-400 flex justify-center items-center gap-2 transition-colors">
            <CheckCircle size={16} /> Check-In: {formatDateTime(formData.clockIn)}
          </p>
        )}
        {formData.clockOut && (
          <p className="text-blue-700 dark:text-blue-400 flex justify-center items-center gap-2 transition-colors">
            <Clock4 size={16} /> Check-Out: {formatDateTime(formData.clockOut)}
          </p>
        )}
        {formData.status && (
          <p className="text-indigo-700 dark:text-indigo-300 font-semibold uppercase flex justify-center items-center gap-2 transition-colors">
            <ClipboardCheck size={16} /> Status: {formData.status}
          </p>
        )}
      </div>

      <CheckInOut setCameraData={handleCameraCapture} />

      {validationErrors.location && (
        <p className="text-red-600 dark:text-red-400 text-xs text-center transition-colors">
          {validationErrors.location}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-colors">
          Remarks
        </label>
        <input
          type="text"
          value={formData.remarks}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, remarks: e.target.value }))
          }
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ring-indigo-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-full font-semibold text-white tracking-wide transition-colors ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        }`}
      >
        {isLoading ? "Submitting..." : "Submit Attendance"}
      </button>

      {error && (
        <p className="text-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-md mt-4 transition-colors">
          {error}
        </p>
      )}
    </form>
  );
};

export default AttendanceForm;
