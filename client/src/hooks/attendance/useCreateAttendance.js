import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAttendance,
  resetAttendanceState,
} from "../../store/attendanceSlice";
import { unwrapResult } from "@reduxjs/toolkit";

export const useCreateAttendance = () => {
  const dispatch = useDispatch();
  const { isLoading, attendance, error } = useSelector(
    (state) => state.attendance
  );

  // Submits attendance and unwraps the result
  const submitAttendance = useCallback(
    async (formData) => {
      if (!formData) return null;
      try {
        const action = await dispatch(createAttendance(formData));
        return unwrapResult(action); // returns payload or throws error
      } catch (err) {
        console.error("Attendance submission failed:", err);
        throw err;
      }
    },
    [dispatch]
  );

  // Resets attendance state manually
  const resetState = useCallback(() => {
    dispatch(resetAttendanceState());
  }, [dispatch]);

  return {
    submitAttendance,
    isLoading,
    attendance,
    error,
    resetState,
  };
};
