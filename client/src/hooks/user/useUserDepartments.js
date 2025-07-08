import { useDispatch } from "react-redux";
import { fetchUserDepartments } from "../../store/userSlice";
import { toast } from "react-toastify";

export const useUserDepartments = () => {
  const dispatch = useDispatch();

  const handleFetchDepartments = async (userId) => {
    if (!userId) return { departments: [] };

    try {
      const res = await dispatch(fetchUserDepartments(userId)).unwrap();
      return res;
    } catch (error) {
      toast.error(`Failed to load departments: ${error}`, {
        position: "top-right",
      });
      return { departments: [] }; 
    }
  };

  return { handleFetchDepartments };
};
