import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useCallback } from "react";
import { moveToNextStage } from "../../store/jobApplicationSlice";

export const useMoveToNextStage = () => {
  const dispatch = useDispatch();

  const {
    moveStageStatus = "",
    loading = false,
    error = null,
  } = useSelector(
    (state) => state.jobApplications ?? {},
    shallowEqual
  );

  const moveStage = useCallback(
    async ({ id, nextStage, notes }) => {
      if (!id || !nextStage) {
        return { success: false, error: "ID and nextStage are required" };
      }

      try {
        const result = await dispatch(moveToNextStage({ id, nextStage, notes }));

        if (moveToNextStage.fulfilled.match(result)) {
          return {
            success: true,
            data: result.payload,
          };
        }

        return {
          success: false,
          error: result.payload?.message || "Failed to move to next stage",
        };
      } catch (err) {
        console.error("Error moving to next stage:", err);
        return {
          success: false,
          error: err?.message || "Unexpected error occurred",
        };
      }
    },
    [dispatch]
  );

  return {
    moveStage,
    moveStageStatus,
    loading,
    error,
  };
};
