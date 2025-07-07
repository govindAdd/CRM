import React, { useState, useRef } from "react";
import { FiEdit2, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";
import { useDeleteUser } from "../../hooks/user/useDeleteUser";
import { useUpdateUserRole } from "../../hooks/user/useUpdateUserRole";

const VALID_ROLES = ["admin", "employee", "manager", "hr", "superadmin", "user", "head"];

const AllUsersList = ({ users }) => {
  const [editingUserId, setEditingUserId] = useState(null);
  const [formRole, setFormRole] = useState("");
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const hoverTimeout = useRef(null);

  const { handleDeleteUser } = useDeleteUser();
  const { handleUpdateRole } = useUpdateUserRole();

  const onEdit = (user) => {
    setEditingUserId(user._id);
    setFormRole(user.role);
  };

  const onCancel = () => {
    setEditingUserId(null);
    setFormRole("");
    setHoveredDropdown(null);
  };

  const onSave = async () => {
    if (!editingUserId || !formRole) return;
    await handleUpdateRole(editingUserId, formRole);
    onCancel();
  };

  const onSelectRole = async (role) => {
    if (!editingUserId || !role) return;
    await handleUpdateRole(editingUserId, role); // ✅ Fix: use selected role directly
    onCancel();
  };

  return (
    <div className="grid gap-4">
      {users.map((user) => {
        const isEditing = editingUserId === user._id;
        const isHovered = hoveredDropdown === user._id;

        return (
          <div
            key={user._id}
            className={`flex items-center justify-between gap-4 p-4 rounded-xl shadow transition-all border ${
              isEditing
                ? "bg-purple-50 dark:bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-purple-500/40 shadow-purple-600/20"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:shadow-xl"
            }`}
          >
            {/* Avatar & Info */}
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-11 h-11">
                <div className="w-full h-full rounded-full overflow-hidden shadow border-2 border-purple-500/30 bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center uppercase font-semibold">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.fullName || user.username} avatar`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.fullName?.charAt(0) || "U"
                  )}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
                    user.status === "online" ? "bg-green-500" : "bg-zinc-400 dark:bg-zinc-600"
                  }`}
                />
                {["admin", "superadmin", "head"].includes(user.role) && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white p-0.5 rounded-full text-[10px] shadow">
                    <FaShieldAlt className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {user.username || user.fullName}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</div>

                {/* Role */}
                <div
                  className="relative mt-2 inline-block"
                  onMouseEnter={() =>
                    isEditing && (clearTimeout(hoverTimeout.current), setHoveredDropdown(user._id))
                  }
                  onMouseLeave={() => {
                    if (isEditing) {
                      hoverTimeout.current = setTimeout(() => setHoveredDropdown(null), 200);
                    }
                  }}
                >
                  {isEditing ? (
                    <>
                      <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <span>
                          Role:{" "}
                          <strong className="text-purple-700 dark:text-white">{formRole}</strong>
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 animate-pulse">
                          Editing...
                        </span>
                      </span>

                      {isHovered && (
                        <ul className="absolute left-full ml-3 top-0 z-20 bg-white dark:bg-zinc-800 border dark:border-zinc-600 rounded-md shadow-md py-1 min-w-[160px]">
                          {VALID_ROLES.map((role) => (
                            <li
                              key={role}
                              onClick={() => onSelectRole(role)}
                              className={`px-3 py-2 text-sm cursor-pointer transition-colors rounded-md ${
                                formRole === role
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white"
                                  : "hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-white"
                              }`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Role: <strong>{user.role}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={onSave}
                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 transition"
                    title="Save"
                  >
                    <FiCheck />
                  </button>
                  <button
                    onClick={onCancel}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition"
                    title="Cancel"
                  >
                    <FiX />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition"
                    title="Edit Role"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Are you sure you want to delete "${user.username || user.fullName}"?`
                      );
                      if (confirmed) {
                        handleDeleteUser(user._id);
                      }
                    }}
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900 dark:text-red-300 transition"
                    title="Delete User"
                  >
                    <FiTrash2 />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllUsersList;
