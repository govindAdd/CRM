import { useDispatch, useSelector } from "react-redux";
import { approveLeaveRequest, resetLeaveStatus } from "../../../store/leaveSlice";
import { useEffect } from "react";
import { toast } from "react-toastify";

const useApproveLeaveRequest = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.leave.status);

  const approveLeave = ({ id, leaveIndex }) => {
    console.log("Approving leave request:", { id, leaveIndex });
    if (!id || leaveIndex === undefined || leaveIndex === null) return;
    dispatch(approveLeaveRequest({ id, leaveIndex }));
  };

  const resetApproveStatus = () => {
    dispatch(resetLeaveStatus());
  };

  useEffect(() => {
    if (success) {
      toast.success("Leave approved successfully.");
      resetApproveStatus();
    }
    if (error) {
      toast.error(error);
      resetApproveStatus();
    }
  }, [success, error, dispatch]);

  useEffect(() => {
    return () => {
      resetApproveStatus(); // cleanup on unmount
    };
  }, []);

  return {
    approveLeave,
    approveStatus: success,
    approveError: error,
    loading,
  };
};

export default useApproveLeaveRequest;
