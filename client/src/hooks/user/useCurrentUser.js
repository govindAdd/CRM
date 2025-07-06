import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "../../store/userSlice";

export const useCurrentUser = () => {
  const dispatch = useDispatch();
  const { currentUser, status, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentUser && status === "idle") {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, currentUser, status]);

  return { currentUser, status, error };
};