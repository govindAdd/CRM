import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useMoveToNextStage } from "../../hooks/job/useMoveToNextStage";

// === STAGES mapped to backend keys & ordered ===
const STAGES = [
  { key: "telephone_interview", label: "Telephone Interview" },
  { key: "face_to_face", label: "Face-to-Face Interview" },
  { key: "virtual_interview", label: "Virtual Interview" },
];

const MoveToNextStageForm = ({ application, onNext }) => {
  const [params, setParams] = useSearchParams();
  // derive currentStage from application if present, otherwise from params (fallback)
  const currentStageFromApp = application?.currentStage;
  const currentStageParam = params.get("stage");
  const currentStage =
    currentStageFromApp || (STAGES.some((s) => s.key === currentStageParam) ? currentStageParam : STAGES[0].key);

  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  const [nextStage, setNextStage] = useState("");
  const [notes, setNotes] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { moveStage, loading } = useMoveToNextStage();

  // Available next stages: show stages *after* currentIndex.
  // Special UX: when on telephone_interview show immediate interview choices first
  const availableNextStages = useMemo(() => {
    const after = STAGES.slice(currentIndex + 1);

    if (currentStage === "telephone_interview") {
      // prefer showing face_to_face and virtual_interview as primary options first
      const preferred = after.filter((s) =>
        ["face_to_face", "virtual_interview"].includes(s.key)
      );
      const rest = after.filter((s) => !["face_to_face", "virtual_interview"].includes(s.key));
      return [...preferred, ...rest];
    }

    return after;
  }, [currentIndex, currentStage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nextStage) {
      toast.error("Please select the next stage.");
      return;
    }

    // must pass backend keys (we are)
    const res = await moveStage({
      id: application?._id,
      nextStage,
      notes,
    });

    console.log("Move Stage Response:", res);
    if (res.success) {
      toast.success("Moved to next stage successfully!");
      setIsTransitioning(true);
      setTimeout(() => {
        setNextStage("");
        setNotes("");
        setIsTransitioning(false);
        // inform parent which stage to show next (we return backend key)
        onNext?.(nextStage);
        setParams({ stage: nextStage });
      }, 400);
    } else {
      toast.error(res.error || "Failed to move to next stage.");
    }
  };

  const currentStageLabel =
    STAGES.find((s) => s.key === application?.currentStage || currentStage)?.label || "N/A";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800">
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="move-stage-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full max-w-2xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 p-6 md:p-8 rounded-2xl shadow-2xl space-y-6"
          >
            {/* === Candidate Summary === */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 space-y-4 bg-white/60 dark:bg-zinc-800/60">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">
                Candidate Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-zinc-800 dark:text-zinc-200">
                <p><span className="font-medium">Name:</span> {application?.fullName}</p>
                <p><span className="font-medium">Email:</span> {application?.email}</p>
                <p><span className="font-medium">Phone:</span> {application?.phone}</p>
                <p><span className="font-medium">Location:</span> {application?.location}</p>
                <p><span className="font-medium">Source:</span> {application?.source}</p>
                <p><span className="font-medium">Stage:</span> {currentStageLabel}</p>
                <p>
                  <span className="font-medium">Resume:</span>{" "}
                  <a
                    href={application?.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 underline"
                  >
                    View
                  </a>
                </p>
              </div>
            </div>

            {/* === Stage Transition Form === */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
                  Move to Next Stage
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Select the next interview stage
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Next Stage <span className="text-red-500">*</span>
                </label>
                <select
                  value={nextStage}
                  onChange={(e) => setNextStage(e.target.value)}
                  required
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-xl p-2 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                >
                  <option value="">-- Select Stage --</option>
                  {availableNextStages.map((stage) => (
                    <option key={stage.key} value={stage.key}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for reviewer or HR..."
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-xl p-2 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-md transition disabled:opacity-60"
              >
                {loading ? "Moving..." : "Move to Stage"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoveToNextStageForm;
