import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActiveEmployees } from "../../store/hrSlice";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";

/**
 * useGetActiveEmployees
 *
 * @param {string} query - Query string for API (e.g., "page=1&search=rahul")
 * @param {number} debounceDelay - Optional debounce delay (ms), default: 400
 */
const useGetActiveEmployees = (query = "", debounceDelay = 400) => {
  const dispatch = useDispatch();
  const { activeEmployees = {}, loading, error } = useSelector((state) => state.hr);

  const cacheRef = useRef(new Map());
  const queryKey = useMemo(() => query.trim(), [query]);

  // Debounced fetch
  const fetchEmployees = useMemo(
    () =>
      debounce((q) => {
        if (!cacheRef.current.has(q)) {
          dispatch(getActiveEmployees(q));
        }
      }, debounceDelay),
    [dispatch, debounceDelay]
  );

  useEffect(() => {
    if (!queryKey) return;
    fetchEmployees(queryKey);
  }, [queryKey, fetchEmployees]);

  useEffect(() => {
    if (queryKey && activeEmployees?.records?.length > 0) {
      cacheRef.current.set(queryKey, activeEmployees);
    }
  }, [queryKey, activeEmployees]);

  useEffect(() => {
    if (error && queryKey) {
      toast.error("Failed to fetch active employees.");
    }
  }, [error, queryKey]);

  const cached = cacheRef.current.get(queryKey);

  return {
    records: cached?.records || [],
    page: cached?.page || 1,
    totalPages: cached?.totalPages || 1,
    totalRecords: cached?.total || 0,
    hasNextPage: cached?.page < cached?.totalPages,
    hasPrevPage: cached?.page > 1,
    loading,
    error,
    refetch: () => dispatch(getActiveEmployees(query)),
  };
};

export default useGetActiveEmployees;
