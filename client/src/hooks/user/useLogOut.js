// src/hooks/user/useLogOut.js
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser, clearUser, clearError } from '../../store/authSlice';
import { toast } from 'react-toastify';
import { resetAppState } from '../../store/actions'; // ✅ GLOBAL STATE RESET

const useLogOut = (onSuccess = () => {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUser());

      if (logoutUser.fulfilled.match(resultAction)) {
        dispatch(clearUser());
        dispatch(resetAppState()); // ✅ Reset all slices that respond to this action
        toast.success("Logged out successfully");
        onSuccess(); // Optional: close modal, clear local UI
        navigate("/login");
      } else {
        throw new Error(resultAction.payload || "Logout failed.");
      }
    } catch (err) {
      dispatch(clearUser()); // Clear anyway on error (session timeout, etc.)
      dispatch(clearError());
      dispatch(resetAppState()); // ✅ Reset even if logout failed
      toast.warn("Session expired or logout failed. Please log in again.");
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
