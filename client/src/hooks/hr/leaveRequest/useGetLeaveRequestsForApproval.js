import { useEffect } from "react";
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

  useEffect(() => {
    dispatch(getAllLeaveRequestsForApproval());

    return () => {
      dispatch(resetLeaveStatus());
    };
  }, [dispatch]);
  console.log("Leave requests: ", createdRequests);
  return {
    leaveRequests: createdRequests,
    getStatus: status,
    getError: error,
  };
};

export default useGetLeaveRequestsForApproval;
