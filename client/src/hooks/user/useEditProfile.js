// hooks/useEditProfile.js
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../store/userSlice";
import { useCallback } from "react";
import { toast } from "react-toastify";

export const useEditProfile = () => {
  const dispatch = useDispatch();
  const { updateStatus, updateError } = useSelector((state) => state.user);

  const handleUpdate = useCallback(async (userData, avatarFile) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, typeof value === "string" ? value.trim() : value);
      }
    });
    if (avatarFile) formData.append("avatar", avatarFile);

    const result = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(result)) {
      toast.success("Profile updated successfully");
    } else {
      toast.error(result.payload || "Failed to update profile");
    }
  }, [dispatch]);

  return {
    updateStatus,
    updateError,
    updateProfile: handleUpdate,
  };
};
