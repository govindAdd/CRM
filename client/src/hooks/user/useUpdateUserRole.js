import { useDispatch } from "react-redux";
import { updateUserRole } from "../../store/userSlice";
import { toast } from "react-toastify";


export const useUpdateUserRole = () => {
  const dispatch = useDispatch();

  const handleUpdateRole = async (userId, newRole) => {
    if (!userId || typeof newRole !== "string") return;

    try {
      const res = await dispatch(updateUserRole({ userId, newRole })).unwrap();
      toast.success(`Role updated to '${res.role}' for ${res.username || res.fullName}`, {
        position: "top-right",
      });
    } catch (error) {
      toast.error(`Role update failed: ${error}`, {
        position: "top-right",
      });
    }
  };

  return { handleUpdateRole };
};
