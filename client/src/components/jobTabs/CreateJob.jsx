import React, { useEffect, useState, Fragment, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import { Listbox, Transition } from "@headlessui/react";
import {
  ChevronDown,
  Check,
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
} from "lucide-react";
import { useCreateJobApplication } from "../../hooks/job/useCreateJobApplication";

const schema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),
  location: yup.string().optional(),
  source: yup.string().required("Source is required"),
  resumeUrl: yup
    .mixed()
    .required("Resume is required")
    .test("fileType", "Unsupported file format", (value) => {
      if (!value) return false;
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
      ];
      return allowedTypes.includes(value.type);
    })
    .test("fileSize", "File must be less than 5MB", (value) => {
      return value && value.size <= 5 * 1024 * 1024;
    }),
});

const sources = [
  "referral",
  "linkedin",
  "website",
  "email",
  "walkin",
  "internal",
  "other",
];

const inputFields = [
  {
    name: "fullName",
    type: "text",
    label: "Full Name",
    placeholder: "Enter full name",
    icon: User,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Enter email",
    icon: Mail,
  },
  {
    name: "phone",
    type: "tel",
    label: "Phone",
    placeholder: "Enter 10-digit phone number",
    icon: Phone,
  },
  {
    name: "location",
    type: "text",
    label: "Location (Optional)",
    placeholder: "City, Country",
    icon: MapPin,
  },
];

const CreateJob = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { create, loading } = useCreateJobApplication();
  const [selectedSource, setSelectedSource] = useState("");
  const [_, setParams] = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const resumeFile = watch("resumeUrl");

  useEffect(() => {
    setValue("source", selectedSource);
  }, [selectedSource, setValue]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        setValue("resumeUrl", acceptedFiles[0], { shouldValidate: true });
      }
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    multiple: false,
  });

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const result = await create(formData);
    if (result.success) {
      toast.success("Application submitted successfully!");
      setIsTransitioning(true);
      setTimeout(() => {
        reset();
        setSelectedSource("");
        onSuccess?.(result.data);
        setParams({ stage: "telephone" });
      }, 300);
    } else {
      toast.error(result.error || "Failed to submit application");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.form
            key="create-job-form"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            encType="multipart/form-data"
            className="w-full max-w-2xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 backdrop-blur-md p-8 rounded-2xl shadow-2xl space-y-6"
          >
            {/* === Heading === */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
                Submit Application
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Fill out the form below to apply
              </p>
            </div>

            {/* === Input Fields === */}
            {inputFields.map(
              ({ name, type, label, placeholder, icon: Icon }) => (
                <div key={name}>
                  <label className="block text-sm mb-1 text-zinc-700 dark:text-zinc-300">
                    {label}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 dark:text-zinc-500">
                      <Icon size={16} />
                    </span>
                    <input
                      {...register(name)}
                      type={type}
                      placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  {errors[name] && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors[name]?.message}
                    </p>
                  )}
                </div>
              )
            )}

            {/* === Source Select === */}
            <div>
              <label className="block text-sm mb-1 text-zinc-700 dark:text-zinc-300">
                Source <span className="text-red-500">*</span>
              </label>
              <Listbox value={selectedSource} onChange={setSelectedSource}>
                <div className="relative">
                  <Listbox.Button className="w-full py-2 pl-4 pr-10 text-left text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600">
                    <span className="block truncate">
                      {selectedSource || "Select source"}
                    </span>
                    <span className="absolute inset-y-0 right-3 flex items-center text-zinc-500 dark:text-zinc-400">
                      <ChevronDown size={18} />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-xl bg-white dark:bg-zinc-800 py-1 text-sm shadow-lg ring-1 ring-black/10 dark:ring-white/10">
                      {sources.map((source) => (
                        <Listbox.Option
                          key={source}
                          value={source}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-purple-100 text-purple-900 dark:bg-zinc-700 dark:text-white"
                                : "text-zinc-900 dark:text-white"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`${
                                  selected ? "font-medium" : "font-normal"
                                } block truncate`}
                              >
                                {source}
                              </span>
                              {selected && (
                                <span className="absolute left-3 inset-y-0 flex items-center text-purple-600 dark:text-purple-400">
                                  <Check size={16} />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
              <input type="hidden" {...register("source")} />
              {errors.source && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.source.message}
                </p>
              )}
            </div>

            {/* === Resume Dropzone === */}
            <div>
              <label className="block text-sm mb-1 text-zinc-700 dark:text-zinc-300">
                Resume <span className="text-red-500">*</span>
              </label>
              <motion.div
                {...getRootProps()}
                initial={false}
                animate={isDragActive ? "active" : "idle"}
                variants={{
                  idle: {
                    scale: 1,
                    borderColor: "#e4e4e7",
                    backgroundColor: "rgba(255,255,255,0.6)",
                  },
                  active: {
                    scale: 1.02,
                    borderColor: "#9333ea",
                    backgroundColor: "rgba(236, 233, 255, 0.6)",
                  },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer bg-white dark:bg-zinc-800 dark:border-zinc-700"
              >
                <input {...getInputProps()} />
                <Upload
                  size={18}
                  className="text-zinc-400 dark:text-zinc-500"
                />
                <p className="text-sm truncate text-zinc-800 dark:text-zinc-200">
                  {resumeFile?.name || "Drag & drop or click to upload resume"}
                </p>
              </motion.div>
              {resumeFile?.type?.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(resumeFile)}
                  alt="Preview"
                  className="mt-2 h-28 object-contain border border-zinc-300 dark:border-zinc-700 rounded-md"
                />
              )}
              {errors.resumeUrl && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.resumeUrl.message}
                </p>
              )}
            </div>

            {/* === Submit Button === */}
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-md transition disabled:opacity-60"
            >
              {loading || isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateJob;
