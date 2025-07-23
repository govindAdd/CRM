import { useDispatch, useSelector } from "react-redux";
import { rejectLeaveRequest, resetLeaveStatus } from "../../../store/leaveSlice";
import { useEffect } from "react";

const useRejectLeaveRequest = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.leave.status);

  const rejectLeave = ({ id, leaveIndex }) => {
    if (!id || leaveIndex === undefined || leaveIndex === null) return;
    dispatch(rejectLeaveRequest({ id, leaveIndex }));
  };

  const resetRejectStatus = () => {
    dispatch(resetLeaveStatus());
  };

  useEffect(() => {
    if (success || error) {
      resetRejectStatus();
    }
  }, [success, error]);

  useEffect(() => {
    return () => {
      resetRejectStatus(); // cleanup on unmount
    };
  }, []);

  return {
    rejectLeave,
    rejectStatus: success,
    rejectError: error,
    loading,
  };
};

export default useRejectLeaveRequest;
