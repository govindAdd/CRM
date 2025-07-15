import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { updateHRRecord } from "../../../store/hrSlice";
import { toast } from "react-toastify";

const useUpdateHRRecord = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.hr);

  const handleUpdateHRRecord = useCallback(
    async (id, data) => {
      try {
        const resultAction = await dispatch(updateHRRecord({ id, data }));
        if (updateHRRecord.fulfilled.match(resultAction)) {
          toast.success("HR record updated successfully.");
          return resultAction.payload;
        } else {
          throw resultAction.payload;
        }
      } catch (err) {
        toast.error(err?.message || "Failed to update HR record.");
        throw err;
      }
    },
    [dispatch]
  );

  return {
    handleUpdateHRRecord,
    loading,
    error,
  };
};

export default useUpdateHRRecord;
