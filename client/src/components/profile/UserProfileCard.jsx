import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { useSelector, shallowEqual } from "react-redux";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaTransgender,
} from "react-icons/fa";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { PiIdentificationBadgeLight } from "react-icons/pi";
import { FiUser, FiEdit2, FiSave, FiX } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useEditProfile } from "../../hooks/user/useEditProfile";
import { useUserDepartments } from "../../hooks/user/useUserDepartments";

const UserProfileCard = () => {
  const user = useSelector((state) => state.user.currentUser, shallowEqual);
  const userId = user?._id;

  const { handleFetchDepartments } = useUserDepartments();
  const { updateProfile, updateStatus } = useEditProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [localUser, setLocalUser] = useState(() => user || {});
  const [departmentNames, setDepartmentNames] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);

  const [newAvatar, setNewAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);

  // Memoize avatar preview
  const avatarPreview = useMemo(
    () => newAvatar || user?.avatar,
    [newAvatar, user?.avatar]
  );

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (newAvatar) URL.revokeObjectURL(newAvatar);
    };
  }, [newAvatar]);

  // Load departments once on mount
  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setDeptLoading(true);
      const res = await handleFetchDepartments(userId);
      if (res?.departments?.length > 0) {
        setDepartmentNames(res.departments.map((d) => d.name));
      } else {
        setDepartmentNames([]);
      }
      setDeptLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Memoized input change handler
  const handleInputChange = useCallback((field, value) => {
    setLocalUser((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Avatar change handler with validation
  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setAvatarError("Please select a valid image file.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setAvatarError("Image size should be less than 2MB.");
        return;
      }
      setAvatarError("");
      if (newAvatar) URL.revokeObjectURL(newAvatar);
      setNewAvatar(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  }, [newAvatar]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setLocalUser(user);
    if (newAvatar) URL.revokeObjectURL(newAvatar);
    setNewAvatar(null);
    setAvatarFile(null);
    setAvatarError("");
    setIsEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [user, newAvatar]);

  // Save profile changes
  const handleSave = useCallback(async () => {
    setIsEditing(false);
    await updateProfile(localUser, avatarFile);
    setAvatarFile(null);
    setAvatarError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [localUser, avatarFile, updateProfile]);

  // Show skeleton while loading
  if (!user || deptLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton height={160} className="rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} height={60} className="rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white/90 dark:bg-zinc-900/90 shadow-lg backdrop-blur-xl rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 transition">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <AvatarSection
          avatar={avatarPreview}
          fullName={user.fullName}
          isEditing={isEditing}
          onAvatarChange={handleAvatarChange}
          fileInputRef={fileInputRef}
          avatarError={avatarError}
        />
        <HeaderInfo
          localUser={localUser}
          user={user}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />
        <EditActions
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
          onEdit={() => setIsEditing(true)}
          loading={updateStatus === "loading"}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
        <ProfileInfo icon={<FaEnvelope />} label="Email" value={localUser.email} isEditing={isEditing} onChange={(val) => handleInputChange("email", val)} type="email" />
        <ProfileInfo icon={<FaPhoneAlt />} label="Phone" value={localUser.phone} isEditing={isEditing} onChange={(val) => handleInputChange("phone", val)} type="tel" />
        <ProfileInfo icon={<FaCalendarAlt />} label="DOB" value={localUser.dob?.slice(0, 10)} isEditing={isEditing} onChange={(val) => handleInputChange("dob", val)} type="date" />
        <ProfileInfo icon={<FaTransgender />} label="Gender" value={localUser.gender} isEditing={isEditing} onChange={(val) => handleInputChange("gender", val)} />
        <ProfileInfo icon={<HiOutlineBuildingOffice2 />} label="Departments" value={departmentNames.join(", ") || "—"} />
        <ProfileInfo icon={<PiIdentificationBadgeLight />} label="Designation" value={localUser.designation} isEditing={isEditing} onChange={(val) => handleInputChange("designation", val)} />
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-sm text-purple-700 dark:text-purple-400 hover:underline"
          aria-label="Change Password"
        >
          Change Password
        </button>
      </div>

      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

// ➕ AvatarSection
const AvatarSection = ({ avatar, fullName, isEditing, onAvatarChange, fileInputRef, avatarError }) => (
  <div className="relative group" aria-label="User Avatar">
    <img
      src={avatar}
      alt={fullName}
      className="w-28 h-28 rounded-full object-cover border-4 border-zinc-300 dark:border-zinc-600 shadow"
      loading="lazy"
    />
    {isEditing && (
      <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white rounded-full cursor-pointer" tabIndex={0} aria-label="Change avatar">
        <input
          type="file"
          accept="image/*"
          onChange={onAvatarChange}
          className="hidden"
          ref={fileInputRef}
          aria-label="Upload avatar"
        />
        <FiUser size={20} />
      </label>
    )}
    {avatarError && (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow z-10">
        {avatarError}
      </div>
    )}
  </div>
);

AvatarSection.propTypes = {
  avatar: PropTypes.string,
  fullName: PropTypes.string,
  isEditing: PropTypes.bool,
  onAvatarChange: PropTypes.func,
  fileInputRef: PropTypes.object,
  avatarError: PropTypes.string,
};

const HeaderInfo = ({ localUser, user, isEditing, onInputChange }) => (
  <div className="flex-1 space-y-1 text-center md:text-left">
    <h2 className="text-3xl font-bold text-zinc-800 dark:text-white">
      {isEditing ? (
        <input
          type="text"
          className="bg-transparent border-b border-gray-300 dark:border-zinc-600 w-full focus:outline-none text-2xl"
          value={localUser.fullName}
          onChange={(e) => onInputChange("fullName", e.target.value)}
          aria-label="Full Name"
        />
      ) : (
        localUser.fullName
      )}
    </h2>
    <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
    <span className="inline-block text-xs mt-1 px-2 py-1 uppercase bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-white rounded-full tracking-wider">
      {user.role}
    </span>
  </div>
);

HeaderInfo.propTypes = {
  localUser: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  isEditing: PropTypes.bool,
  onInputChange: PropTypes.func,
};

const EditActions = ({ isEditing, onSave, onCancel, onEdit, loading }) => (
  <div className="mt-4 md:mt-0">
    {isEditing ? (
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={loading}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition"
          aria-label="Save profile changes"
        >
          <FiSave />
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-200 dark:bg-zinc-800 rounded-xl hover:bg-gray-300 dark:hover:bg-zinc-700 transition"
          aria-label="Cancel editing"
        >
          <FiX /> Cancel
        </button>
      </div>
    ) : (
      <button
        onClick={onEdit}
        className="flex items-center gap-1 px-4 py-2 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-white rounded-xl hover:bg-purple-200 dark:hover:bg-purple-800 transition"
        aria-label="Edit profile"
      >
        <FiEdit2 /> Edit Profile
      </button>
    )}
  </div>
);

EditActions.propTypes = {
  isEditing: PropTypes.bool,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  onEdit: PropTypes.func,
  loading: PropTypes.bool,
};

const ProfileInfo = ({
  icon,
  label,
  value,
  isEditing = false,
  onChange,
  type = "text",
}) => (
  <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-700">
    <div className="text-xl text-gray-400 dark:text-zinc-500">{icon}</div>
    <div className="flex flex-col w-full">
      <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      {isEditing && onChange ? (
        <input
          type={type}
          className="text-sm font-medium bg-transparent border-b border-gray-300 dark:border-zinc-600 focus:outline-none dark:text-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
      ) : (
        <span className="text-sm font-medium text-zinc-800 dark:text-white truncate">
          {value || "—"}
        </span>
      )}
    </div>
  </div>
);

ProfileInfo.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isEditing: PropTypes.bool,
  onChange: PropTypes.func,
  type: PropTypes.string,
};

export default UserProfileCard;
