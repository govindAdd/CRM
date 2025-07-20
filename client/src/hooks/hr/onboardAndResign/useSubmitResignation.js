import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitResignation } from "../../../store/hrSlice";
import { toast } from "react-toastify";


const useSubmitResignation = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.hr);

  const handleSubmitResignation = useCallback(
    async (payload = {}) => {
      const { id, noticePeriod } = payload;

      if (!id || !noticePeriod) {
        toast.error("Missing required fields.");
        return;
      }

      try {
        const response = await dispatch(
          submitResignation({ id, noticePeriod })
        ).unwrap();

        toast.success("Resignation submitted successfully.");
        return response;
      } catch (err) {
        const message =
          err?.message || "Failed to submit resignation. Please try again.";
        toast.error(message);
        throw new Error(message);
      }
    },
    [dispatch]
  );

  return {
    handleSubmitResignation,
    loading,
    error,
  };
};

export default useSubmitResignation;