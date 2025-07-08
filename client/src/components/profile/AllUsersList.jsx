import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { FiEdit2, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";
import { useDeleteUser } from "../../hooks/user/useDeleteUser";
import { useUpdateUserRole } from "../../hooks/user/useUpdateUserRole";
import { useFetchAllDepartments } from "../../hooks/department/useFetchAllDepartments";
import { useAssignMemberInDepartment } from "../../hooks/department/useAssignMemberInDepartment";
import { useUserDepartments } from "../../hooks/user/useUserDepartments";

const VALID_ROLES = ["admin", "employee", "manager", "hr", "superadmin", "user", "head"];

const AllUsersList = ({ users }) => {
  const [editingUserId, setEditingUserId] = useState(null);
  const [formRole, setFormRole] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [userDepartmentsMap, setUserDepartmentsMap] = useState({});
  const fetchedUserIds = useRef(new Set());

  const { handleDeleteUser } = useDeleteUser();
  const { handleUpdateRole } = useUpdateUserRole();
  const { assignMember, assignStatus } = useAssignMemberInDepartment();
  const { departments, status: deptStatus } = useFetchAllDepartments();
  const isDeptLoading = deptStatus === "loading";

  const { handleFetchDepartments } = useUserDepartments();

  // 🚀 Load departments for all users (optimized)
  useEffect(() => {
    const loadDepartments = async () => {
      for (const user of users) {
        if (!user?._id || fetchedUserIds.current.has(user._id)) continue;
        fetchedUserIds.current.add(user._id);
        const res = await handleFetchDepartments(user._id);
        setUserDepartmentsMap((prev) => ({
          ...prev,
          [user._id]: res?.departments?.length > 0
            ? res.departments.map((d) => d.name)
            : ["Unassigned"],
        }));
      }
    };
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, handleFetchDepartments]);

  const getDepartmentName = useCallback(
    (dept) => {
      if (!dept) return "Unassigned";
      const deptId = typeof dept === "string" ? dept : dept?._id;
      const found = departments.find((d) => d._id === deptId);
      return found?.name || "Unassigned";
    },
    [departments]
  );

  const onEdit = useCallback((user) => {
    setEditingUserId(user._id);
    setFormRole(user.role);
    const deptId =
      typeof user.department === "string"
        ? user.department
        : user.department?._id || "";
    setFormDepartment(deptId);
  }, []);

  const onCancel = useCallback(() => {
    setEditingUserId(null);
    setFormRole("");
    setFormDepartment("");
  }, []);

  const onSave = useCallback(async () => {
    if (!editingUserId) return;
    const user = users.find((u) => u._id === editingUserId);
    if (!user) return;
    const originalRole = user.role;
    const originalDeptId =
      typeof user.department === "string"
        ? user.department
        : user.department?._id || "";
    const roleChanged = formRole !== originalRole;
    const deptChanged = formDepartment !== originalDeptId;
    try {
      if (roleChanged) {
        await handleUpdateRole(editingUserId, formRole);
      }
      if (deptChanged && formDepartment) {
        await assignMember({
          id: formDepartment,
          userId: editingUserId,
          role: formRole,
        });
      }
    } catch (error) {
      console.error("Failed to update user role or department", error);
    } finally {
      onCancel();
    }
  }, [editingUserId, users, formRole, formDepartment, handleUpdateRole, assignMember, onCancel]);

  // Memoize department names for each user
  const departmentNamesMap = useMemo(() => {
    const map = {};
    users.forEach((user) => {
      map[user._id] = userDepartmentsMap[user._id] || ["Loading..."];
    });
    return map;
  }, [users, userDepartmentsMap]);

  return (
    <div className="grid gap-4">
      {users.map((user) => {
        const isEditing = editingUserId === user._id;
        const departmentNames = departmentNamesMap[user._id];
        const originalDeptId =
          typeof user.department === "string"
            ? user.department
            : user.department?._id || "";
        const isSaveDisabled =
          ((!formRole || formRole === user.role) &&
            (!formDepartment || formDepartment === originalDeptId)) ||
          assignStatus === "loading";
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
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.fullName?.charAt(0) || "U"
                  )}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-zinc-900 ${
                    user.status === "online" ? "bg-green-500" : "bg-zinc-400 dark:bg-zinc-600"
                  }`}
                  aria-label={user.status === "online" ? "Online" : "Offline"}
                />
                {["admin", "superadmin", "head"].includes(user.role) && (
                  <span
                    title={user.role}
                    className="absolute -top-1 -right-1 bg-purple-600 text-white p-0.5 rounded-full text-[10px] shadow"
                  >
                    <FaShieldAlt className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {user.username || user.fullName}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</div>
                {/* Role & Department */}
                <div className="relative mt-2 inline-block">
                  {isEditing ? (
                    <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                      <div className="flex items-center gap-2">
                        <label className="text-xs" htmlFor={`role-select-${user._id}`}>Role:</label>
                        <select
                          id={`role-select-${user._id}`}
                          value={formRole}
                          onChange={(e) => setFormRole(e.target.value)}
                          className="bg-white dark:bg-zinc-800 border dark:border-zinc-600 rounded-md px-2 py-1 text-sm text-zinc-800 dark:text-white"
                        >
                          {VALID_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs" htmlFor={`dept-select-${user._id}`}>Department:</label>
                        <select
                          id={`dept-select-${user._id}`}
                          value={formDepartment}
                          onChange={(e) => setFormDepartment(e.target.value)}
                          className="bg-white dark:bg-zinc-800 border dark:border-zinc-600 rounded-md px-2 py-1 text-sm text-zinc-800 dark:text-white"
                          disabled={isDeptLoading}
                        >
                          <option value="" disabled>
                            Select Department
                          </option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 animate-pulse w-max">
                        Editing...
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      Role: <strong>{user.role}</strong> {" · "}
                      Department: {" "}
                      <strong className="text-blue-600 dark:text-blue-300">
                        {departmentNames.join(", ") || "—"}
                      </strong>
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
                    aria-label="Save changes"
                    disabled={isSaveDisabled}
                  >
                    <FiCheck />
                  </button>
                  <button
                    onClick={onCancel}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition"
                    title="Cancel"
                    aria-label="Cancel editing"
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
                    aria-label={`Edit role for ${user.username || user.fullName}`}
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
                    aria-label={`Delete user ${user.username || user.fullName}`}
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

AllUsersList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string,
      fullName: PropTypes.string,
      email: PropTypes.string,
      avatar: PropTypes.string,
      role: PropTypes.string.isRequired,
      department: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
      ]),
      status: PropTypes.string,
    })
  ).isRequired,
};

export default AllUsersList;
