import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLeaveRequestsForApproval,
  resetLeaveStatus,
} from "../../../store/leaveSlice";

const useGetLeaveRequestsForApproval = () => {
  const dispatch = useDispatch();
  const { createdRequests, status, error } = useSelector(
    (state) => state.leave
  );

  // ✅ Memoize refetch function
  const refetchLeaveRequests = useCallback(() => {
    dispatch(getAllLeaveRequestsForApproval());
  }, [dispatch]);

  useEffect(() => {
    refetchLeaveRequests();

    return () => {
      dispatch(resetLeaveStatus());
    };
  }, [refetchLeaveRequests, dispatch]);

  return {
    leaveRequests: createdRequests || [],
    getStatus: status,
    getError: error,
    refetchLeaveRequests,
  };
};

export default useGetLeaveRequestsForApproval;
