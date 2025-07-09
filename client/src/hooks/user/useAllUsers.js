import { useEffect, useCallback } from "react";
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

  const fetchUsers = useCallback(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && allUsersStatus === "idle") {
      fetchUsers();
    }
  }, [autoFetch, allUsersStatus, fetchUsers]);

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
    fetchUsers, // Return function for manual fetch
  };
};