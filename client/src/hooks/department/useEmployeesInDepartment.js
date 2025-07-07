import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchEmployeesInDepartment } from "../../store/departmentSlice";
import { toast } from "react-toastify";

export const useFetchEmployeesInDepartment = ({
  departmentId,
  autoFetch = false,
  page = 1,
  limit = 10,
}) => {
  const dispatch = useDispatch();

  const [status, setStatus] = useState("idle");
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const getEmployees = async () => {
    setStatus("loading");
    try {
      const res = await dispatch(
        fetchEmployeesInDepartment({ departmentId, page, limit })
      ).unwrap();

      setEmployees(res.results || []);
      setTotal(res.total || 0);
      setStatus("succeeded");
    } catch (err) {
      const errMsg = err?.message || "Failed to fetch employees";
      setError(errMsg);
      toast.error(errMsg);
      setStatus("failed");
    }
  };

  useEffect(() => {
    if (autoFetch && departmentId) {
      getEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId, page, limit, autoFetch]);

  return {
    employees,
    total,
    empStatus: status,
    empError: error,
    refetchEmployees: getEmployees,
  };
};