import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useMoveToOffered } from "../../hooks/job/useMoveToOffered";
import {
  CheckCircle,
  Loader2,
  ImagePlus,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

// ✅ Robust validation
const schema = yup.object({
  avatar: yup
    .mixed()
    .required("Avatar is required")
    .test("fileSize", "Max file size 2MB", (files) =>
      files?.[0] ? files[0].size <= 2 * 1024 * 1024 : false
    )
    .test("fileType", "Only JPG/PNG/WebP allowed", (files) =>
      files?.[0]
        ? ["image/jpeg", "image/png", "image/webp"].includes(files[0].type)
        : false
    ),
  offerLetterUrl: yup.string().url("Must be a valid URL").nullable(),
  offeredSalary: yup
    .number()
    .typeError("Salary is required")
    .positive("Salary must be positive")
    .required("Salary is required"),
});

function Offered({ application, onNext, setParams }) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { hireCandidate, loading, error } = useMoveToOffered();
  const [visible, setVisible] = useState(true);
  const [previews, setPreviews] = useState([]);

  const handleSuccess = (nextStage) => {
    setVisible(false);
    setTimeout(() => {
      onNext?.(nextStage);
      setParams({ stage: nextStage });
      setVisible(true);
      reset();
      setPreviews([]);
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

  // Drag-drop handler
  const onDrop = useCallback((e, onChange) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      onChange(files);
    }
  }, []);

  // Generate previews when avatar changes
  const handleFiles = (files, onChange) => {
    if (!files) return;
    onChange(files);
    const urls = Array.from(files).map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setPreviews(urls);
  };

  // Remove preview
  const removePreview = (index, onChange) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onChange([]);
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
          className="relative bg-white p-6 rounded-xl shadow-md space-y-6"
        >
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-10">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          )}

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

              <Controller
                name="avatar"
                control={control}
                render={({ field: { onChange } }) => (
                  <div
                    tabIndex={0}
                    role="button"
                    aria-label="Upload candidate avatar"
                    className="mt-2 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition transform hover:scale-105 hover:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, (f) => handleFiles(f, onChange))}
                    onClick={() =>
                      document.getElementById("avatarInput").click()
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        document.getElementById("avatarInput").click();
                      }
                    }}
                  >
                    {previews.length > 0 ? (
                      <div className="flex flex-wrap gap-4 justify-center">
                        {previews.map((file, index) => (
                          <div
                            key={index}
                            className="relative w-24 h-24 rounded-full overflow-hidden border shadow"
                          >
                            {/* Skeleton effect */}
                            <motion.div
                              initial={{ opacity: 0.5 }}
                              animate={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              className="absolute inset-0 bg-gray-200 animate-pulse"
                            />
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              aria-label="Remove avatar"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePreview(index, onChange);
                              }}
                              className="absolute -top-2 -right-2 bg-white rounded-full shadow hover:bg-red-50"
                            >
                              <XCircle className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <ImagePlus className="w-10 h-10 mb-2" />
                        <p className="text-sm">
                          Drag & drop image, or click to browse
                        </p>
                      </div>
                    )}
                    <input
                      id="avatarInput"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleFiles(e.target.files, onChange)}
                    />
                  </div>
                )}
              />

              {errors.avatar && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.avatar.message}
                </p>
              )}
            </div>

            {/* Offer Letter URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Offer Letter URL
              </label>
              <Controller
                name="offerLetterUrl"
                control={control}
                render={({ field }) => (
                  <input
                    type="url"
                    {...field}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                )}
              />
              {errors.offerLetterUrl && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.offerLetterUrl.message}
                </p>
              )}
            </div>

            {/* Offered Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Offered Salary
              </label>
              <Controller
                name="offeredSalary"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    {...field}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                )}
              />
              {errors.offeredSalary && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.offeredSalary.message}
                </p>
              )}
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Hire Candidate
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Offered;