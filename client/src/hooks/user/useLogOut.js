import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, clearUser, clearError } from "../../store/authSlice";
import { toast } from "react-toastify";
import { resetAppState } from "../../store/actions";

const useLogOut = (onSuccess = () => {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      // Call logout API (removes refresh token cookie on server)
      await dispatch(logoutUser()).unwrap();

      // Clear access token and state
      localStorage.removeItem("authToken");
      dispatch(clearUser());
      dispatch(resetAppState());

      toast.success("Logged out successfully");
      onSuccess(); // Optionally run a callback (e.g., close modal)
      navigate("/login");
    } catch (err) {
      // Fallback in case of logout API failure
      dispatch(clearUser());
      dispatch(clearError());
      dispatch(resetAppState());
      localStorage.removeItem("authToken");

      const message =
        typeof err === "string"
          ? err
          : err?.message || "Logout failed or session expired";

      toast.warn(message);
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
