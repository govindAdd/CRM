import React, { useEffect, useState, Fragment, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
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

// === Validation Schema ===
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

// === Source Options ===
const sources = [
  "Referral",
  "LinkedIn",
  "Website",
  "Email",
  "Walk-in",
  "Internal",
  "Other",
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

const CreateJob = () => {
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
      reset();
      setSelectedSource("");
    } else {
      toast.error(result.error || "Failed to submit application");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center px-4">
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        encType="multipart/form-data"
        className="w-full max-w-xl bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-2xl shadow-xl space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-white mb-1">
            Submit Job Application
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Fill the form to apply
          </p>
        </div>

        {/* === Input Fields === */}
        {inputFields.map(({ name, type, label, placeholder, icon: Icon }) => (
          <div key={name}>
            <label className="block mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {label}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
                <Icon size={16} />
              </span>
              <input
                {...register(name)}
                type={type}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            {errors[name] && (
              <p className="text-xs text-red-500 mt-1">
                {errors[name]?.message}
              </p>
            )}
          </div>
        ))}

        {/* === Source Dropdown === */}
        <div>
          <label className="block mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Source <span className="text-red-500">*</span>
          </label>
          <Listbox value={selectedSource} onChange={setSelectedSource}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2 pl-4 pr-10 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
                <span className="block truncate">
                  {selectedSource || "Select source"}
                </span>
                <span className="absolute inset-y-0 right-3 flex items-center text-zinc-500">
                  <ChevronDown size={18} />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-1"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-zinc-800 py-1 text-sm shadow-lg ring-1 ring-black/10">
                  {sources.map((source) => (
                    <Listbox.Option
                      key={source}
                      value={source}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active
                            ? "bg-blue-100 text-blue-900 dark:bg-zinc-700 dark:text-white"
                            : "text-zinc-900 dark:text-zinc-100"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-semibold" : "font-normal"
                            }`}
                          >
                            {source}
                          </span>
                          {selected && (
                            <span className="absolute left-3 inset-y-0 flex items-center text-blue-600 dark:text-blue-400">
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
            <p className="text-xs text-red-500 mt-1">{errors.source.message}</p>
          )}
        </div>

        {/* === Resume Upload with Drag & Drop === */}
        <div>
          <label className="block mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Upload Resume <span className="text-red-500">*</span>
          </label>
          <motion.div
            {...getRootProps()}
            initial={false}
            animate={isDragActive ? "active" : "idle"}
            variants={{
              idle: {
                borderColor: "#d4d4d8",
                backgroundColor: "#ffffff",
                scale: 1,
                boxShadow: "0px 0px 0px rgba(0,0,0,0)",
              },
              active: {
                borderColor: "#3b82f6",
                backgroundColor: "#eff6ff",
                scale: 1.02,
                boxShadow: "0px 0px 12px rgba(59,130,246,0.25)",
              },
            }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer select-none dark:bg-zinc-800 dark:border-zinc-700"
          >
            <input {...getInputProps()} />
            <Upload size={18} className="text-zinc-400" />
            <p className="text-sm truncate text-zinc-800 dark:text-zinc-200">
              {resumeFile?.name || "Drag & drop your resume or click to upload"}
            </p>
          </motion.div>

          {resumeFile && resumeFile.type.startsWith("image/") && (
            <img
              src={URL.createObjectURL(resumeFile)}
              alt="Preview"
              className="mt-2 h-32 object-contain rounded-md border border-zinc-200 dark:border-zinc-700"
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {loading || isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </motion.form>
    </div>
  );
};

export default CreateJob;
