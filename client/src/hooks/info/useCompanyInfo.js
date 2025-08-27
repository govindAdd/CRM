import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useEffect, useCallback, useMemo } from "react";
import { fetchCompanyInfo } from "../../store/authSlice";

const useCompanyInfo = () => {
  const dispatch = useDispatch();

  // Select fields independently (no new object each render)
  const companyInfo = useSelector((state) => state.auth?.companyInfo);
  const loading = useSelector((state) => state.auth?.loading);
  const error = useSelector((state) => state.auth?.error);

  // Auto-fetch if missing
  useEffect(() => {
    if (!companyInfo && !loading) {
      dispatch(fetchCompanyInfo());
    }
  }, [dispatch, companyInfo, loading]);

  // Manual refetch
  const refetchCompanyInfo = useCallback(() => {
    if (!loading) {
      dispatch(fetchCompanyInfo());
    }
  }, [dispatch, loading]);

  // Derived state with memoization
  return useMemo(
    () => ({
      companyInfo,
      isLoading: !!loading,
      isError: !!error,
      error: error || null,
      isSuccess: Boolean(companyInfo && !error),
      hasCompanyInfo: Boolean(companyInfo),
      refetchCompanyInfo,
    }),
    [companyInfo, loading, error, refetchCompanyInfo]
  );
};

export default useCompanyInfo;
