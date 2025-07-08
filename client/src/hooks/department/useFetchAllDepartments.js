import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchAllDepartments } from "../../store/departmentSlice";
import { toast } from "react-toastify";

export const useFetchAllDepartments = () => {
  const dispatch = useDispatch();
  const { departments, totalCount, status, error } = useSelector((state) => state.department);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resultAction = await dispatch(
          fetchAllDepartments({ page: 1, limit: 1000, search: "", sortBy: "name", sortOrder: "asc" })
        );
        const result = resultAction.payload;

        if (result && Array.isArray(result)) {
          toast.success(`${result.length} departments loaded`, { autoClose: 2000 });
        }
      } catch (err) {
        const message = err?.message || "Failed to fetch departments";
        toast.error(message);
      }
    };

    fetchData();
  }, [dispatch]);

  return {
    departments: Array.isArray(departments) ? departments : [],
    totalCount,
    status,
    error,
  };
};
