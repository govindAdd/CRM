import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useMoveToOffered } from "../../hooks/job/useMoveToOffered";
import { CheckCircle, Loader2, Upload } from "lucide-react";
import { toast } from "react-toastify";

function Offered({ application, onNext, setParams }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { hireCandidate, loading, error } = useMoveToOffered();
  const [visible, setVisible] = useState(true);

  const handleSuccess = (nextStage) => {
    setVisible(false);
    setTimeout(() => {
      onNext?.(nextStage);
      setParams({ stage: nextStage });
      setVisible(true);
      reset();
    }, 400);
  };

  const onSubmit = async (data) => {
    const avatarFile = data.avatar?.[0];
    const result = await hireCandidate({
      id: application._id,
      avatarFile,
      offerLetterUrl: data.offerLetterUrl || undefined,
      offeredSalary: data.offeredSalary || undefined,
    });

    if (result?.success) {
      toast.success("Candidate moved to Onboarding stage!");
      handleSuccess("onboarding");
    } else {
      toast.error(result?.error || "Failed to hire candidate");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="offered-form"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="bg-white p-6 rounded-xl shadow-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Finalize Hiring
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Candidate Avatar <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  {...register("avatar", { required: "Avatar is required" })}
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
                />
                <Upload className="w-5 h-5 text-gray-500" />
              </div>
              {errors.avatar && (
                <p className="text-red-600 text-sm mt-1">{errors.avatar.message}</p>
              )}
            </div>

            {/* Offer Letter URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Offer Letter URL
              </label>
              <input
                type="url"
                {...register("offerLetterUrl")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Offered Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Offered Salary
              </label>
              <input
                type="number"
                {...register("offeredSalary")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hire Candidate
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Offered;
