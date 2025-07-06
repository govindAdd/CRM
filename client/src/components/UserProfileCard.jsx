import React, { useState, useEffect, useTransition, useMemo } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaTransgender,
} from "react-icons/fa";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { PiIdentificationBadgeLight } from "react-icons/pi";
import { FiUser, FiEdit2, FiSave, FiX } from "react-icons/fi";
import { useSelector, shallowEqual } from "react-redux";
import { useEditProfile } from "../hooks/user/useEditProfile";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ChangePasswordModal from "../components/ChangePasswordModal";

const UserProfileCard = () => {
  const user = useSelector((state) => state.user.currentUser, shallowEqual);
  const { updateProfile, updateStatus } = useEditProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [localUser, setLocalUser] = useState(user || {});
  const [newAvatar, setNewAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton height={160} count={1} className="rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {Array(6)
            .fill(0)
            .map((_, idx) => (
              <Skeleton key={idx} height={60} className="rounded-xl" />
            ))}
        </div>
      </div>
    );
  }

  const avatarPreview = useMemo(
    () => newAvatar || user.avatar,
    [newAvatar, user.avatar]
  );

  const handleInputChange = (field, value) => {
    setLocalUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(URL.createObjectURL(file));
      setAvatarFile(file);
    }
  };

  const handleCancel = () => {
    setLocalUser(user);
    setNewAvatar(null);
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsEditing(false);
    await updateProfile(localUser, avatarFile); // optimistic: assume success
    setAvatarFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-md hover:shadow-lg transition-all rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <AvatarSection
          avatar={avatarPreview}
          fullName={user.fullName}
          isEditing={isEditing}
          onAvatarChange={handleAvatarChange}
        />

        <HeaderInfo
          localUser={localUser}
          user={user}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />

        <EditActions
          isEditing={isEditing}
          updateStatus={updateStatus}
          onSave={handleSave}
          onCancel={handleCancel}
          onEdit={() => startTransition(() => setIsEditing(true))}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
        <ProfileInfo
          icon={<FaEnvelope />}
          label="Email"
          value={localUser.email}
          type="email"
          isEditing={isEditing}
          onChange={(val) => handleInputChange("email", val)}
        />
        <ProfileInfo
          icon={<FaPhoneAlt />}
          label="Phone"
          value={localUser.phone}
          type="tel"
          isEditing={isEditing}
          onChange={(val) => handleInputChange("phone", val)}
        />
        <ProfileInfo
          icon={<FaCalendarAlt />}
          label="DOB"
          value={localUser.dob?.slice(0, 10)}
          type="date"
          isEditing={isEditing}
          onChange={(val) => handleInputChange("dob", val)}
        />
        <ProfileInfo
          icon={<FaTransgender />}
          label="Gender"
          value={localUser.gender}
          isEditing={isEditing}
          onChange={(val) => handleInputChange("gender", val)}
        />
        <ProfileInfo
          icon={<HiOutlineBuildingOffice2 />}
          label="Department"
          value={
            typeof localUser.department === "string"
              ? localUser.department
              : localUser.department?.name || "—"
          }
          isEditing={false}
        />
        <ProfileInfo
          icon={<PiIdentificationBadgeLight />}
          label="Designation"
          value={localUser.designation}
          isEditing={isEditing}
          onChange={(val) => handleInputChange("designation", val)}
        />
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-sm text-purple-700 dark:text-purple-400 hover:underline"
        >
          Change Password
        </button>
      </div>

      <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

const AvatarSection = ({ avatar, fullName, isEditing, onAvatarChange }) => (
  <div className="relative group">
    <img
      src={avatar}
      alt={fullName}
      className="w-28 h-28 rounded-full object-cover border-4 border-zinc-300 dark:border-zinc-600 shadow"
      loading="lazy"
    />
    {isEditing && (
      <label className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white rounded-full cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={onAvatarChange}
          className="hidden"
        />
        <FiUser size={20} />
      </label>
    )}
  </div>
);

const HeaderInfo = ({ localUser, user, isEditing, onInputChange }) => (
  <div className="flex-1 space-y-1 text-center md:text-left">
    <h2 className="text-3xl font-bold text-zinc-800 dark:text-white">
      {isEditing ? (
        <input
          type="text"
          className="bg-transparent border-b border-gray-300 dark:border-zinc-600 focus:outline-none w-full text-2xl"
          value={localUser.fullName}
          onChange={(e) => onInputChange("fullName", e.target.value)}
        />
      ) : (
        localUser.fullName
      )}
    </h2>
    <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
    <span className="inline-block mt-1 text-xs uppercase tracking-wide bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-white px-2 py-1 rounded-full">
      {user.role}
    </span>
  </div>
);

const EditActions = ({ isEditing, updateStatus, onSave, onCancel, onEdit }) => (
  <div className="mt-4 md:mt-0">
    {isEditing ? (
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={updateStatus === "loading"}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
        >
          <FiSave /> {updateStatus === "loading" ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-200 dark:bg-zinc-800 rounded-xl hover:bg-gray-300 dark:hover:bg-zinc-700 transition"
        >
          <FiX /> Cancel
        </button>
      </div>
    ) : (
      <button
        onClick={onEdit}
        className="flex items-center gap-1 px-4 py-2 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-white rounded-xl hover:bg-purple-200 dark:hover:bg-purple-800 transition"
      >
        <FiEdit2 /> Edit Profile
      </button>
    )}
  </div>
);

const ProfileInfo = ({
  icon,
  label,
  value,
  isEditing,
  onChange,
  type = "text",
}) => (
  <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-700">
    <div className="text-xl text-gray-400 dark:text-zinc-500">{icon}</div>
    <div className="flex flex-col w-full">
      <span className="text-xs uppercase text-zinc-500 dark:text-zinc-400 tracking-wide">
        {label}
      </span>
      {isEditing && onChange ? (
        <input
          type={type}
          className="text-sm font-medium bg-transparent border-b border-gray-300 dark:border-zinc-600 focus:outline-none dark:text-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <span className="text-sm font-medium text-zinc-800 dark:text-white truncate">
          {value || "—"}
        </span>
      )}
    </div>
  </div>
);

export default UserProfileCard;