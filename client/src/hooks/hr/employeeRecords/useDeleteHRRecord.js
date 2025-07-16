import { useDispatch, useSelector } from "react-redux";
import { deleteHRRecord } from "../../../store/hrSlice";
import { toast } from "react-toastify";

const useDeleteHRRecord = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.hr);

  const handleDeleteHRRecord = async (id, onSuccess) => {
    try {
      if (!id) throw new Error("No ID provided for deletion");

      // ✅ Await the dispatched async thunk action
      const resultAction = await dispatch(deleteHRRecord(id));

      if (deleteHRRecord.fulfilled.match(resultAction)) {
        toast.success("HR record deleted successfully.");
        if (onSuccess) onSuccess(resultAction.payload);
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload?.message || "Delete failed.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete HR record.");
      throw error;
    }
  };

  return {
    handleDeleteHRRecord,
    loading,
  };
};

export default useDeleteHRRecord;
