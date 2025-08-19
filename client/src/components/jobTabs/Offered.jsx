import React, { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { useMoveToOffered } from "../../hooks/job/useMoveToOffered";
import { CheckCircle, Loader2, ImagePlus, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useFetchAllDepartments } from "../../hooks/department/useFetchAllDepartments";

// ✅ Validation schema
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
  salaryAmount: yup
    .number()
    .typeError("Salary is required")
    .positive("Salary must be positive")
    .required("Salary is required"),
  salaryCurrency: yup.string().required("Currency is required"),
  salaryPeriod: yup.string().required("Period is required"),
  department: yup.string().required("Department is required"),
  keySkills: yup.string().nullable(),
  responsibilities: yup.string().nullable(),
});

function Offered({ application, onNext, setParams }) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      salaryCurrency: "INR",
      salaryPeriod: "monthly",
      department: "",
    },
  });

  const { departments } = useFetchAllDepartments({ page: 1, limit: 20 });

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
    const payload = {
      id: application._id,
      avatarFile,
      salaryAmount: data.salaryAmount,
      salaryCurrency: data.salaryCurrency,
      salaryPeriod: data.salaryPeriod,
      department: data.department,
      keySkills: data.keySkills
        ? data.keySkills.split(",").map((s) => s.trim())
        : [],
      responsibilities: data.responsibilities
        ? data.responsibilities.split(",").map((r) => r.trim())
        : [],
    };
    console.log("Submitting offer with payload:", payload);

    const result = await hireCandidate(payload);
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

  // Handle preview
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
          className="relative bg-gradient-to-br from-white to-[#f0f9ff] 
                     dark:from-gray-900 dark:to-gray-800 
                     p-6 rounded-2xl shadow-xl 
                     border border-[#e0e7ff] dark:border-gray-700 
                     space-y-6"
        >
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="mt-3 text-indigo-700 dark:text-indigo-300 font-medium">
                  Processing your offer...
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-600 p-3 rounded-xl">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Finalize Hiring
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Complete the offer details to move forward
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="mt-1 flex flex-col items-center justify-center 
                               border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 
                               rounded-xl p-6 cursor-pointer transition-all duration-200 
                               hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-gray-700/40"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, (f) => handleFiles(f, onChange))}
                    onClick={() =>
                      document.getElementById("avatarInput").click()
                    }
                  >
                    {previews.length > 0 ? (
                      <div className="flex flex-wrap gap-4 justify-center">
                        {previews.map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-24 h-24 rounded-full overflow-hidden 
                                       border-2 border-indigo-200 dark:border-indigo-500/50 shadow-md"
                          >
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                            <motion.button
                              type="button"
                              aria-label="Remove avatar"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removePreview(index, onChange);
                              }}
                              className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-red-50 dark:hover:bg-red-900/40"
                            >
                              <XCircle className="w-6 h-6 text-red-500" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-indigo-500 dark:text-indigo-400">
                        <ImagePlus className="w-10 h-10 mb-3" />
                        <p className="text-sm font-medium text-center text-gray-600 dark:text-gray-300">
                          Drag & drop image here
                          <br />
                          or{" "}
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                            browse files
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          JPG, PNG, WebP • Max 2MB
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
                <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.avatar.message}</span>
                </div>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign Department <span className="text-red-500">*</span>
              </label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600
                               dark:bg-gray-900 dark:text-gray-100
                               shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                               h-11 border px-4"
                  >
                    <option value="">-- Select Department --</option>
                    {departments?.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.department && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.department.message}
                </p>
              )}
            </div>

            {/* Salary Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Salary Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount
                  </label>
                  <Controller
                    name="salaryAmount"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                          ₹
                        </div>
                        <input
                          type="number"
                          {...field}
                          className="mt-1 block w-full pl-8 rounded-lg 
                                     border-gray-300 dark:border-gray-600 
                                     dark:bg-gray-900 dark:text-gray-100
                                     shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                                     h-11 border px-4"
                        />
                      </div>
                    )}
                  />
                  {errors.salaryAmount && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errors.salaryAmount.message}
                    </p>
                  )}
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <Controller
                    name="salaryCurrency"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600
                                   dark:bg-gray-900 dark:text-gray-100
                                   shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                                   h-11 border px-4"
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    )}
                  />
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Period
                  </label>
                  <Controller
                    name="salaryPeriod"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600
                                   dark:bg-gray-900 dark:text-gray-100
                                   shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                                   h-11 border px-4"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Key Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Key Skills <span className="text-gray-500 dark:text-gray-400 font-normal">(comma separated)</span>
              </label>
              <Controller
                name="keySkills"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    {...field}
                    placeholder="React, Node.js, MongoDB"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600
                               dark:bg-gray-900 dark:text-gray-100
                               shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                               h-11 border px-4"
                  />
                )}
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsibilities <span className="text-gray-500 dark:text-gray-400 font-normal">(comma separated)</span>
              </label>
              <Controller
                name="responsibilities"
                control={control}
                render={({ field }) => (
                  <textarea
                    rows={3}
                    {...field}
                    placeholder="Develop frontend components, Manage deployments, Collaborate with design team"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600
                               dark:bg-gray-900 dark:text-gray-100
                               shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                               border p-4"
                  />
                )}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full inline-flex justify-center items-center px-6 py-3 rounded-xl 
                         bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-medium shadow-lg 
                         hover:from-indigo-700 hover:to-violet-800 focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-indigo-500 transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Hire Candidate
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Offered;
