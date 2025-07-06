import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchEmployeesInDepartment } from "../../store/departmentSlice";
import { toast } from "react-toastify";

export const useFetchEmployeesInDepartment = ({
  departmentId,
  page = 1,
  limit = 10,
  search = "",
  sortBy = "fullName",
  sortOrder = "asc",
  autoFetch = true,
} = {}) => {
  const dispatch = useDispatch();
  const {
    employees,
    departmentMeta,
    empStatus,
    empError,
    total,
    page: currentPage,
    limit: currentLimit,
  } = useSelector((state) => state.departmentEmployees);

  useEffect(() => {
    if (autoFetch && departmentId) {
      dispatch(
        fetchEmployeesInDepartment({
          departmentId,
          page,
          limit,
          search,
          sortBy,
          sortOrder,
        })
      );
    }
  }, [dispatch, departmentId, page, limit, search, sortBy, sortOrder, autoFetch]);

  useEffect(() => {
    if (empStatus === "failed" && empError) {
      toast.error(empError);
    }
  }, [empStatus, empError]);

  return {
    employees,
    departmentMeta,
    empStatus,
    empError,
    total,
    currentPage,
    currentLimit,
  };
};
