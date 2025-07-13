import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../store/authSlice";
import { toast } from "react-toastify";

const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (credentials) => {
    try {
      const user = await dispatch(loginUser(credentials)).unwrap();
      toast.success("Logged in successfully!");
      navigate("/");
      return user;
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Login failed. Please try again.";
      toast.error(`${message}`);
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
