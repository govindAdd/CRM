import { useDispatch, useSelector } from "react-redux";
import { updateDepartment } from "../../store/departmentSlice";
import { useCallback } from "react";
import { toast } from "react-toastify";

export const useUpdateDepartment = () => {
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector(
    (state) => state.department.updateStatus || {
      loading: false,
      error: null,
      success: false,
    }
  );

  const update = useCallback(async (id, updates) => {
    try {
      const result = await dispatch(updateDepartment({ id, updates })).unwrap();
      toast.success("Department updated");
      return { success: true, data: result };
    } catch (err) {
      const message = err?.message || "Update failed";
      toast.error(message);
      return { success: false, error: message };
    }
  }, [dispatch]);

  return {
    updateDepartment: update,
    loading,
    error,
    success,
  };
};
