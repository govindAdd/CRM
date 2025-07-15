import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { searchHRRecords } from "../../../store/hrSlice";
import { toast } from "react-toastify";

const useSearchHRRecords = () => {
  const dispatch = useDispatch();
  const { searchResults, loading, error } = useSelector((state) => state.hr);

  const handleSearchHRRecords = useCallback(
    async (query) => {
      if (!query || !query.trim()) {
        toast.warning("Please enter a valid search term.");
        return;
      }

      try {
        const resultAction = await dispatch(searchHRRecords(query));
        if (searchHRRecords.fulfilled.match(resultAction)) {
          const count = resultAction.payload.length;
          toast.success(`${count} record${count !== 1 ? "s" : ""} found.`);
          return resultAction.payload;
        } else {
          throw resultAction.payload;
        }
      } catch (err) {
        toast.error(err?.message || "Search failed.");
        throw err;
      }
    },
    [dispatch]
  );

  return {
    searchResults,
    loading,
    error,
    handleSearchHRRecords,
  };
};

export default useSearchHRRecords;
