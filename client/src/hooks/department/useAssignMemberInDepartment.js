import { useDispatch, useSelector } from "react-redux";
import { assignDepartmentMember } from "../../store/departmentSlice";
import { useCallback } from "react";

export const useAssignMemberInDepartment = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.department);

  const assignMember = useCallback(async ({ id, userId, role }) => {
    return dispatch(assignDepartmentMember({ id, userId, role }));
  }, [dispatch]);

  return {
    assignMember,
    assignStatus: status,
    assignError: error,
  };
};