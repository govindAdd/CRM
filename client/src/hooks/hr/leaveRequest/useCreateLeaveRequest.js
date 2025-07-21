import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLeaveRequest, resetLeaveStatus } from "../../../store/leaveSlice";

const useCreateLeaveRequest = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.leave.status);

  const submitLeaveRequest = ({ id, data }) => {
    if (!id || !data) return;
    dispatch(createLeaveRequest({ id, data }));
  };

  useEffect(() => {
    if (success || error) {
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
