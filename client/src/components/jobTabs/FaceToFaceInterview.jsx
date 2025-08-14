import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Star,
  CheckCircle2,
  XCircle,
  Check,
  ChevronDown,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Listbox } from "@headlessui/react";
import { useFaceToFaceInterview } from "../../hooks/job/useFaceToFaceInterview";
import { useSearchParams } from "react-router-dom";

const REJECTION_REASONS = [
  "not_qualified",
  "candidate_not_interested",
  "candidate_not_reachable",
  "not_suitable",
  "no_fit_for_current_need",
  "location_issue",
  "salary_not_comfortable",
];

const toTitleCase = (str) =>
  str
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

function FaceToFaceInterview({ application, onNext }) {
  const { register, handleSubmit, reset } = useForm();
  const { faceToFaceInterview, loading } = useFaceToFaceInterview();
  const [, setParams] = useSearchParams();

  const [rating, setRating] = useState(0);
  const [result, setResult] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSuccessTransition = (stage) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setParams({ stage });
      onNext?.(stage);
      setIsTransitioning(false);
    }, 400);
  };

  const onSubmit = async (data) => {
    if (!result) return toast.error("Please choose Approve or Reject");
    if (result === "reject" && !rejectionReason)
      return toast.error("Please select a rejection reason");

    const payload = {
      applicationId: application.id,
      notes: data.feedback?.trim() || "",
      rating,
      result,
      rejectionReason: result === "reject" ? rejectionReason : undefined,
    };

    const res = await faceToFaceInterview(payload);
    console.log("Face-to-Face Interview Response:", res);

    if (res.success) {
      toast.success(
        result === "approve"
          ? "Candidate approved and moved to Offered stage"
          : "Candidate rejected successfully"
      );

      reset();
      setRating(0);
      setResult(null);
      setRejectionReason("");

      const nextStage = result === "approve" ? "offered" : "rejected";
      handleSuccessTransition(nextStage);
    } else {
      toast.error(res.error || "Failed to submit feedback");
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] px-4 py-10 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="face-to-face-form"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="bg-white dark:bg-gray-900 max-w-2xl w-full rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 px-8 py-6"
          >
            <div className="flex justify-center mb-4">
              <UserCheck className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
              Face-to-Face Interview Evaluation
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              Fill out the performance details for this round.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Feedback Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes / Feedback
                </label>
                <textarea
                  {...register("feedback")}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Write interview notes or feedback..."
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Star
                      key={num}
                      className={`w-6 h-6 cursor-pointer ${
                        num <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                      onClick={() => setRating(num)}
                    />
                  ))}
                </div>
              </div>

              {/* Rejection Reason */}
              {result === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rejection Reason
                  </label>
                  <Listbox value={rejectionReason} onChange={setRejectionReason}>
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 sm:text-sm text-gray-900 dark:text-gray-100">
                        <span className="block truncate">
                          {rejectionReason
                            ? toTitleCase(rejectionReason)
                            : "Select reason"}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </span>
                      </Listbox.Button>

                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm scrollbar-hide">
                        {REJECTION_REASONS.map((reason) => (
                          <Listbox.Option
                            key={reason}
                            value={reason}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                  : "text-gray-900 dark:text-gray-100"
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {toTitleCase(reason)}
                                </span>
                                {selected && (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-500 dark:text-red-300">
                                    <Check className="h-4 w-4" />
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 mt-6 justify-end">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setResult("reject")}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold border rounded-lg transition ${
                    result === "reject"
                      ? "bg-red-500 text-white border-red-500"
                      : "text-red-600 dark:text-red-400 border-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setResult("approve")}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                    result === "approve"
                      ? "bg-blue-700 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve & Continue
                </button>
              </div>

              {result && (
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
                  >
                    {loading ? "Submitting..." : "Submit Decision"}
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FaceToFaceInterview;
