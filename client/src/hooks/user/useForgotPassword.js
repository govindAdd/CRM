import { useDispatch, useSelector } from 'react-redux';
import { forgotPasswordUser } from '../../store/authSlice';
import { toast } from 'react-toastify';

const useForgotPassword = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);

  const handleForgotPassword = async (email) => {
    const result = await dispatch(forgotPasswordUser(email));
    if (forgotPasswordUser.fulfilled.match(result)) {
      toast.success(result.payload);
    } else {
      toast.error(result.payload);
    }
  };

  return { handleForgotPassword, loading };
};

export default useForgotPassword;
