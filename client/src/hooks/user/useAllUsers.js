import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../../store/userSlice";
import { toast } from "react-toastify";

export const useAllUsers = ({ autoFetch = true } = {}) => {
  const dispatch = useDispatch();
  const {
    users: allUsers,
    allUsersStatus,
    allUsersError,
  } = useSelector((state) => state.user);

  useEffect(() => {
    if (autoFetch && allUsersStatus === "idle") {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, autoFetch, allUsersStatus]);

  useEffect(() => {
    if (allUsersStatus === "failed" && allUsersError) {
      toast.error(`Failed to fetch users: ${allUsersError}`, {
        position: "top-right",
      });
    }
  }, [allUsersStatus, allUsersError]);

  return {
    allUsers,
    allUsersStatus,
    allUsersError,
  };
};