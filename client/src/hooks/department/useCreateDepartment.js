import { useDispatch, useSelector } from "react-redux";
import { createDepartment } from "../../store/departmentSlice";
import { toast } from "react-toastify";

/**
 * Custom hook to create a new department with loading + error state.
 */
const useCreateDepartment = () => {
  const dispatch = useDispatch();
  const { createStatus, createError } = useSelector((state) => state.department);

  const handleCreateDepartment = async (formData) => {
    try {
      const result = await dispatch(createDepartment(formData)).unwrap();
      toast.success("Department created successfully!");
      return { success: true, data: result };
    } catch (err) {
      const message =
        typeof err === "string" ? err : err?.message || "❌ Failed to create department";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  return {
    handleCreateDepartment,
    createStatus,
    createError,
  };
};

export default useCreateDepartment;
