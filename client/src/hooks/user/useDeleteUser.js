// src/hooks/useDeleteUser.js
import { useDispatch } from "react-redux";
import { deleteUserById, fetchAllUsers } from "../../store/userSlice";
import { toast } from "react-toastify";


export const useDeleteUser = () => {
  const dispatch = useDispatch();

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await dispatch(deleteUserById(userId)).unwrap();
      toast.success("User deleted successfully", { position: "top-right" });
      dispatch(fetchAllUsers());
    } catch (error) {
      toast.error(`Failed to delete user: ${error}`, { position: "top-right" });
    }
  };

  return { handleDeleteUser };
};