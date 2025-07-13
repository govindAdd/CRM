import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useCreateAttendance } from "./useCreateAttendance";
import { useUserDepartments } from "../user/useUserDepartments";
import { useLocalCheckInData } from "./useLocalCheckInData";
import { calculateAttendanceStatus } from "../../utils/calculateAttendanceStatus";

export const useAttendanceFormLogic = () => {
  const { user } = useSelector((state) => state.auth);
  const { submitAttendance, isLoading, error } = useCreateAttendance();
  const { handleFetchDepartments } = useUserDepartments();
  const { load, save, clear } = useLocalCheckInData();

  const getTodayISO = () => {
    const d = new Date();
    // Use local date instead of UTC to avoid timezone issues
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    employee: user?._id || "",
    date: getTodayISO(),
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

  useEffect(() => {
    const saved = load();
    if (saved?.clockIn && saved?.location) {
      setFormData((prev) => ({
        ...prev,
        ...saved,
        clockOut: "",
        status: "",
      }));
    }
  }, []);

  useEffect(() => {
    if (!user?._id || formData.department) return;
    const fetch = async () => {
      const res = await handleFetchDepartments(user._id);
      const dept = res?.departments?.[0]?.departmentId;
      if (dept) setFormData((p) => ({ ...p, department: dept }));
    };
    fetch();
  }, [user?._id, formData.department]);

  const handleCameraCapture = ({ timestamp, location }) => {
    setFormData((prev) => {
      const isCheckIn = !prev.clockIn;
      const clockIn = prev.clockIn || timestamp;
      const clockOut = !isCheckIn ? timestamp : "";
      const status = clockOut ? calculateAttendanceStatus(clockIn, clockOut) : "";

      const updated = {
        ...prev,
        clockIn,
        clockOut,
        location,
        remarks: `${prev.remarks} [${timestamp}]`,
        status,
      };

      if (isCheckIn) save({ ...updated, clockOut: "", status: "" });
      return updated;
    });
  };

  const validate = () => {
    const required = ["employee", "date", "status", "shift", "clockIn", "clockOut", "type", "department"];
    const errors = {};

    required.forEach((key) => {
      if (!formData[key] || (typeof formData[key] === "string" && formData[key].trim() === "")) {
        errors[key] = "Required";
      }
    });

    if (!formData.location || typeof formData.location.lat !== "number" || typeof formData.location.lng !== "number") {
      errors["location"] = "Location required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) return setValidationErrors(errors);

    setValidationErrors({});
    const res = await submitAttendance(formData);
    if (res) clear();
  };

  return {
    formData,
    setFormData,
    handleCameraCapture,
    handleSubmit,
    validationErrors,
    isLoading,
    error,
  };
};