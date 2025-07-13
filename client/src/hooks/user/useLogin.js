import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../store/authSlice";
import { toast } from "react-toastify";

const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (credentials, redirectTo = "/") => {
    try {
      // Dispatch login thunk to get user + access token
      const user = await dispatch(loginUser(credentials)).unwrap();

      // Show success message and redirect
      toast.success("Logged in successfully");
      navigate(redirectTo);

      return user;
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.response?.data?.message ||
            err?.message ||
            "Login failed. Please try again.";

      toast.error(message);
      throw new Error(message);
    }
  };

  return {
    handleLogin,
    loading,
    error,
  };
};

export default useLogin;
