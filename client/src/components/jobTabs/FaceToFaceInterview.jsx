import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, Star, CheckCircle2, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const STAGES = [
  "Create",
  "Telephone",
  "Face-to-Face",
  "HR Round",
  "Offer & Onboarding",
];

function FaceToFaceInterview() {
  const { register, handleSubmit, reset } = useForm();
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (data) => {
    const payload = { ...data, rating };
    console.log("Submitted Feedback:", payload);
    setSubmitted(true);
    toast.success("Feedback submitted successfully!");
    reset();
  };

  return (
    <div className="min-h-[calc(100vh-100px)] px-4 py-10 bg-gradient-to-br from-white to-gray-100 flex flex-col items-center gap-6">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border px-8 py-6"
      >
        <div className="flex justify-center mb-4">
          <UserCheck className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
          Face-to-Face Interview Evaluation
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Please fill out the candidate's performance for this round.
        </p>

        {/* Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes / Feedback
              </label>
              <textarea
                {...register("feedback")}
                rows={4}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Write interview notes or feedback..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star
                    key={num}
                    className={`w-6 h-6 cursor-pointer ${
                      num <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-400"
                    }`}
                    onClick={() => setRating(num)}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6 justify-end">
              <button
                type="button"
                onClick={() => toast.error("Candidate Rejected")}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-red-600 border border-red-500 rounded-lg hover:bg-red-50 transition"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve & Continue
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center text-green-600 font-medium mt-4">
            Feedback submitted. You may proceed to the next stage.
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default FaceToFaceInterview;
