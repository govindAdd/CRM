import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLeaveRequest, resetLeaveStatus } from "../../../store/leaveSlice";
import { toast } from "react-toastify";

const useCreateLeaveRequest = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.leave.status);
  
  const submitLeaveRequest = ({ id, data }) => {
    if (!id || !data) return;
    dispatch(createLeaveRequest({ id, data }));
  };

  useEffect(() => {
    if (success) {
      toast.success("Leave request submitted successfully.");
      dispatch(resetLeaveStatus());
    }
    if (error) {
      toast.error(error);
      dispatch(resetLeaveStatus());
    }
  }, [success, error, dispatch]);

  return {
    submitLeaveRequest,
    loading,
    success,
    error,
  };
};

export default useCreateLeaveRequest;