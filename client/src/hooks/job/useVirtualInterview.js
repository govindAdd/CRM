import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useCallback } from "react";
import { moveToVirtualInterview } from "../../store/jobApplicationSlice";

export const useVirtualInterview = () => {
  const dispatch = useDispatch();

  const { loading = false, error = null } = useSelector(
    (state) => state.jobApplications ?? {},
    shallowEqual
  );

  const virtualInterview = useCallback(
    async ({ applicationId, notes, result, rejectionReason }) => {
      if (!applicationId) {
        return { success: false, error: "Application ID is required" };
      }

      try {
        const resultAction = await dispatch(
          moveToVirtualInterview({ applicationId, notes, result, rejectionReason })
        );

        if (moveToVirtualInterview.fulfilled.match(resultAction)) {
          return { success: true, data: resultAction.payload };
        }

        return {
          success: false,
          error:
            resultAction.payload?.message ||
            "Failed to update virtual interview",
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

  return { virtualInterview, loading, error };
};

