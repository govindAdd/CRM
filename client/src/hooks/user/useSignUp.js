import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../store/authSlice";
import { toast } from "react-toastify";

const useRegister = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleRegister = async (formData) => {
    try {
      const result = await dispatch(registerUser(formData)).unwrap();
      toast.success("Account created successfully");
      return result;
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Registration failed. Please try again.";
      toast.error(message);
      throw err;
    }
  };

  return { handleRegister, loading, error };
};

export default useRegister;
