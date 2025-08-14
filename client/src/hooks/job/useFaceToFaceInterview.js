import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useCallback } from "react";
import { moveToFaceToFaceInterview } from "../../store/jobApplicationSlice";

export const useFaceToFaceInterview = () => {
  const dispatch = useDispatch();

  const { loading = false, error = null } = useSelector(
    (state) => state.jobApplications ?? {},
    shallowEqual
  );

  const faceToFaceInterview = useCallback(
    async ({ applicationId, notes, result, rejectionReason }) => {
      if (!applicationId) {
        return { success: false, error: "Application ID is required" };
      }

      try {
        const resultAction = await dispatch(
          moveToFaceToFaceInterview({ applicationId, notes, result, rejectionReason })
        );

        if (moveToFaceToFaceInterview.fulfilled.match(resultAction)) {
          return { success: true, data: resultAction.payload };
        }

        return {
          success: false,
          error:
            resultAction.payload?.message ||
            "Failed to update face-to-face interview",
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

  return { faceToFaceInterview, loading, error };
};
