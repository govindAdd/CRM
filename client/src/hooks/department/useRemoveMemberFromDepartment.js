import { useDispatch, useSelector } from "react-redux";
import { removeDepartmentMember } from "../../store/departmentSlice";
import { toast } from "react-toastify";
import { useCallback } from "react";

const useRemoveMemberFromDepartment = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.department);

  const handleRemoveMember = useCallback(async ({ id, userId }) => {
    try {
      await dispatch(removeDepartmentMember({ id, userId })).unwrap();
      toast.success("Member removed from department!");
      return { success: true };
    } catch (err) {
      const message = err?.message || "Failed to remove member";
      toast.error(message);
      return { success: false, error: message };
    }
  }, [dispatch]);

  return {
    handleRemoveMember,
    removeStatus: status,
    removeError: error,
  };
};

export default useRemoveMemberFromDepartment; 