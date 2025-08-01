import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { createJobApplication } from "../../store/jobApplicationSlice";

export const useCreateJobApplication = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.jobApplication);

  const create = useCallback(
    async (formData) => {
      try {
        const resultAction = await dispatch(createJobApplication(formData));

        if (createJobApplication.fulfilled.match(resultAction)) {
          return {
            success: true,
            data: resultAction.payload,
          };
        } else {
          return {
            success: false,
            error: resultAction.payload?.message || "Submission failed",
          };
        }
      } catch (err) {
        return {
          success: false,
          error: err?.message || "Unexpected error occurred",
        };
      }
    },
    [dispatch]
  );

  return {
    create,
    loading,
    error,
  };
};
