// features/publicProfile/usePublicProfile.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicProfile, clearPublicProfile } from "../../store/publicProfileSlice";

export const usePublicProfile = (username) => {
  const dispatch = useDispatch();
  const { employee, hr, loading, error } = useSelector((state) => state.publicProfile);

  useEffect(() => {
    if (username) dispatch(fetchPublicProfile(username));
    return () => dispatch(clearPublicProfile());
  }, [username, dispatch]);

  return { employee, hr, loading, error };
};
