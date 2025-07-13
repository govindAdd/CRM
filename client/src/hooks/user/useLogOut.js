import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, clearUser, clearError } from "../../store/authSlice";
import { toast } from "react-toastify";
import { resetAppState } from "../../store/actions"; // ✅ GLOBAL STATE RESET

const useLogOut = (onSuccess = () => {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap(); // ✅ Throws if error

      dispatch(clearUser());
      dispatch(resetAppState());
      toast.success("✅ Logged out successfully");

      onSuccess(); // optional callback for modal close, etc.
      navigate("/login");
    } catch (err) {
      // Still reset state even on failure (e.g. expired session)
      dispatch(clearUser());
      dispatch(clearError());
      dispatch(resetAppState());

      const message =
        typeof err === "string"
          ? err
          : err?.message || "Logout failed or session expired";

      toast.warn(`${message}`);
      navigate("/login");
    }
  };

  return {
    handleLogout,
    loading,
    error,
  };
};

export default useLogOut;