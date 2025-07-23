import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createHRRecord } from "../../../store/hrSlice";
import { toast } from "react-toastify";

const useCreateHRRecord = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.hr);

  const handleCreateHRRecord = async (formData, redirectTo = "/hr") => {
    try {
      // Dispatch createHRRecord thunk
      const hr = await dispatch(createHRRecord(formData)).unwrap();

      toast.success("HR record created successfully");
      navigate(redirectTo);

      return hr;
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Failed to create HR record";

      toast.error("Failed to create HR record");
      throw new Error(message);
    }
  };

  return {
    handleCreateHRRecord,
    loading,
    error,
  };
};

export default useCreateHRRecord;
