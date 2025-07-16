import { useDispatch, useSelector } from "react-redux";
import { restoreHRRecord } from "../../../store/hrSlice";
import { toast } from "react-toastify";

const useRestoreHRRecord = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.hr);

  const handleRestoreHRRecord = async (id) => {
    try {
      if (!id) throw new Error("No ID provided for restore");

      // ✅ Await the dispatched async thunk action
      const resultAction = await dispatch(restoreHRRecord(id));

      if (restoreHRRecord.fulfilled.match(resultAction)) {
        toast.success("HR record restored successfully.");
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload?.message || "Restore failed.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to restore HR record.");
      throw error;
    }
  };

  return {
    handleRestoreHRRecord,
    loading,
  };
};

export default useRestoreHRRecord;
