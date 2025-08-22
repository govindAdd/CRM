import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useCallback } from "react";
import { markAsHired } from "../../store/jobApplicationSlice";

export const useMoveToOffered = () => {
  const dispatch = useDispatch();

  const { loading = false, error = null } = useSelector(
    (state) => state.jobApplications ?? {},
    shallowEqual
  );

  const hireCandidate = useCallback(
    async ({ id, avatarFile, salaryAmount, salaryCurrency, salaryPeriod, keySkills, responsibilities, department, designation }) => {
      if (!id) {
        return { success: false, error: "Application ID is required" };
      }
      try {
        // forward all fields collected from the form
        const resultAction = await dispatch(
          markAsHired({
            id,
            avatarFile,
            salaryAmount,
            salaryCurrency,
            salaryPeriod,
            keySkills,
            designation,
            responsibilities,
            department,
          })
        );

        if (markAsHired.fulfilled.match(resultAction)) {
          return { success: true, data: resultAction.payload };
        }

        return {
          success: false,
          error:
            resultAction.payload?.message ||
            "Failed to mark candidate as hired",
        };
      } catch (err) {
        return {
          success: false,
          error: err?.message || "Unexpected error occurred",
        };
      }
    },
    [dispatch]
  );

  return { hireCandidate, loading, error };
};