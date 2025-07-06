import { useDispatch, useSelector } from 'react-redux';
import { resetPasswordUser } from '../../store/authSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const useResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(state => state.auth);

  const handleResetPassword = async ({ token, password, confirmPassword }) => {
    const result = await dispatch(resetPasswordUser({ token, password, confirmPassword }));
    if (resetPasswordUser.fulfilled.match(result)) {
      toast.success("Password reset successful");
      navigate('/login');
    } else {
      toast.error(result.payload);
    }
  };

  return { handleResetPassword, loading };
};

export default useResetPassword;
