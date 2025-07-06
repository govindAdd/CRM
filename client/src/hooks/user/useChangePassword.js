import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../store/userSlice";
import { toast } from "react-toastify";

export const useChangePassword = () => {
  const dispatch = useDispatch();
  const { updateStatus, updateError } = useSelector((state) => state.user);

  const handleChangePassword = async (oldPassword, newPassword) => {
    const res = await dispatch(changePassword({ oldPassword, newPassword }));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Password updated");
    } else {
      toast.error(res.payload || "Failed to update password");
    }
  };

  return { handleChangePassword, updateStatus, updateError };
};
