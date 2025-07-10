import React, { useState, useEffect, useRef } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { useCreateAttendance } from "../../hooks/attendance/useCreateAttendance";
import { useUserDepartments } from "../../hooks/user/useUserDepartments";
import CheckInOut from "./CheckInOut";
import { CheckCircle, Clock4, ClipboardCheck } from "lucide-react";

const LS_KEY = "pending_checkin_data";

const saveToLocalStorage = (data) => {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
};

const loadFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || null;
  } catch {
    return null;
  }
};

const removeFromLocalStorage = () => {
  localStorage.removeItem(LS_KEY);
};

const AttendanceForm = () => {
  const { submitAttendance, isLoading, error } = useCreateAttendance();
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { handleFetchDepartments } = useUserDepartments();

  const getTodayISODate = () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today.toISOString();
  };

  const [formData, setFormData] = useState({
    employee: user?._id || "",
    date: getTodayISODate(),
    status: "",
    shift: "morning",
    clockIn: "",
    clockOut: "",
    remarks: "Attended standup and demo session",
    type: "web",
    department: "",
    location: { lat: null, lng: null },
  });

  const [validationErrors, setValidationErrors] = useState({});

  const cameraDataRef = useRef(null);

  // Load check-in from localStorage
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved?.clockIn && saved?.location) {
      setFormData((prev) => ({
        ...prev,
        ...saved,
        clockOut: "",
        status: "",
      }));
    }
  }, []);

  // Fetch department
  useEffect(() => {
    if (!user?._id || formData.department) return;
    const fetchDepartmentOnce = async () => {
      const response = await handleFetchDepartments(user._id);
      const firstDepartment = response?.departments?.[0];
      if (firstDepartment?.departmentId) {
        setFormData((prev) => ({
          ...prev,
          employee: user._id,
          department: firstDepartment.departmentId,
        }));
      }
    };
    fetchDepartmentOnce();
  }, [user?._id, formData.department, handleFetchDepartments]);

  // Update form data from CheckInOut
  const handleCameraCapture = (data) => {
    const { timestamp, location } = data;
    cameraDataRef.current = data;

    setFormData((prev) => {
      const isFirstCheck = !prev.clockIn;
      const newClockIn = prev.clockIn || timestamp;
      const newClockOut = !isFirstCheck ? timestamp : "";

      const durationHours =
        newClockOut && newClockIn
          ? (new Date(newClockOut) - new Date(newClockIn)) / (1000 * 60 * 60)
          : 0;

      const status =
        durationHours >= 9
          ? "present"
          : durationHours >= 4.5
          ? "half-day"
          : durationHours >= 1
          ? "leave"
          : "absent";

      const updated = {
        ...prev,
        clockIn: newClockIn,
        clockOut: newClockOut,
        location,
        remarks: `${prev.remarks} [${timestamp}]`,
        status: newClockOut ? status : "",
      };

      if (isFirstCheck) {
        saveToLocalStorage({
          ...updated,
          clockOut: "",
          status: "",
        });
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "employee",
      "date",
      "status",
      "shift",
      "clockIn",
      "clockOut",
      "type",
      "department",
    ];

    const errors = {};
    requiredFields.forEach((field) => {
      if (
        formData[field] === null ||
        formData[field] === undefined ||
        (typeof formData[field] === "string" && formData[field].trim() === "")
      ) {
        errors[field] = "This field is required";
      }
    });

    if (
      !formData.location ||
      typeof formData.location.lat !== "number" ||
      typeof formData.location.lng !== "number"
    ) {
      errors["location"] = "Location is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    const res = await submitAttendance(formData);
    if (res) removeFromLocalStorage();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-5xl mx-auto px-4 py-6 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl space-y-6 text-slate-800"
    >
      <h2 className="text-center text-xl sm:text-2xl font-bold uppercase tracking-widest text-indigo-700">
        Attendance
      </h2>

      <div className="space-y-2 text-center text-xs sm:text-sm">
        {formData.clockIn && (
          <p className="text-green-700 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Check-In: {new Date(formData.clockIn).toLocaleString()}
          </p>
        )}
        {formData.clockOut && formData.clockOut !== formData.clockIn && (
          <p className="text-blue-700 flex items-center justify-center gap-2">
            <Clock4 className="w-4 h-4" />
            Check-Out: {new Date(formData.clockOut).toLocaleString()}
          </p>
        )}
        {formData.status && (
          <p className="text-indigo-700 font-semibold uppercase flex items-center justify-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Status: {formData.status}
          </p>
        )}
      </div>

      <div className="min-h-[350px] md:min-h-[400px] w-full">
        <CheckInOut setCameraData={handleCameraCapture} />
        {validationErrors.location && (
          <p className="text-xs text-red-500 mt-2 text-center">
            {validationErrors.location}
          </p>
        )}
      </div>

      <div className="grid gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Remarks
          </label>
          <input
            type="text"
            value={formData.remarks}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                remarks: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-full text-sm font-semibold uppercase tracking-wider transition-all shadow hover:shadow-lg ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isLoading ? "Submitting..." : "Submit Attendance"}
        </button>
      </div>

      {error && (
        <div className="text-center text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-4 py-2">
          {error}
        </div>
      )}
    </form>
  );
};

export default AttendanceForm;
