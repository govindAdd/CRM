import { useDispatch, useSelector } from "react-redux";
import { deleteDepartment } from "../../store/departmentSlice";
import { toast } from "react-toastify";

export const useDeleteDepartment = () => {
  const dispatch = useDispatch();
  const { deleteStatus, error } = useSelector((state) => state.department);

  const handleDelete = async (id, force = true) => {
    try {
      await dispatch(deleteDepartment(`${id}?force=${force}`)).unwrap();
      toast.success(`Department ${force ? 'hard' : 'soft'} deleted`);
    } catch (err) {
      const message = err?.message || "Failed to delete department";
      toast.error(message);
    }
  };

  return {
    handleDelete,
    deleteStatus,
    error,
  };
};
