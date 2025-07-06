import { useState, useMemo, useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import {
  FaUser, FaEnvelope, FaPhone, FaTransgender,
  FaCalendarAlt, FaLock
} from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import useRegister from "../../hooks/user/useSignUp";
import logo from "../../assets/logoNew.png";
import bannerImage from "../../assets/banner-image.png";

// Validation schema
const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  gender: yup.string().oneOf(["male", "female", "other"], "Invalid gender").required("Gender is required"),
  dob: yup.date().nullable().required("Date of Birth is required").typeError("Invalid Date"),
  password: yup.string().required("Password is required").min(6, "Minimum 6 characters"),
  confirmPassword: yup.string()
    .required("Confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
  avatar: yup
    .mixed()
    .test("required", "Avatar is required", (value) => value && value.length > 0)
    .test("fileType", "Unsupported file format", (value) => {
      const supported = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      return value?.[0] && supported.includes(value[0].type);
    })
    .test("fileSize", "Max 2MB", (value) => !value?.[0] || value[0].size <= 2 * 1024 * 1024),
});

const RegisterForm = () => {
  const navigate = useNavigate();
  const { handleRegister, loading } = useRegister();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onTouched",
    defaultValues: { gender: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarRegister = register("avatar");

  useLayoutEffect(() => {
    return () => URL.revokeObjectURL(avatarPreview ?? "");
  }, [avatarPreview]);

  const handleAvatarChange = (e, onChange) => {
    const file = e.target.files[0];
    URL.revokeObjectURL(avatarPreview ?? "");

    if (file) {
      requestIdleCallback(() => {
        setAvatarPreview(URL.createObjectURL(file));
      });
    }

    onChange(e);
    trigger("avatar");
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, key === "avatar" ? value[0] : value);
    });

    try {
      await handleRegister(formData);
      toast.success("Account created successfully!");
      reset();
      URL.revokeObjectURL(avatarPreview ?? "");
      setAvatarPreview(null);
      requestAnimationFrame(() => navigate("/"));
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const inputFields = useMemo(() => [
    { label: "Full Name", name: "fullName", icon: <FaUser className="text-blue-500" /> },
    { label: "Username", name: "username", icon: <FaUser className="text-purple-500" /> },
    { label: "Email", name: "email", type: "email", icon: <FaEnvelope className="text-red-500" /> },
    { label: "Phone", name: "phone", icon: <FaPhone className="text-green-500" /> },
    { label: "Gender", name: "gender", type: "select", icon: <FaTransgender className="text-pink-500" /> },
    { label: "Date of Birth", name: "dob", type: "date", icon: <FaCalendarAlt className="text-indigo-500" /> },
  ], []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-0" />
      <div className="relative z-10 w-full max-w-4xl bg-white bg-opacity-90 rounded-3xl shadow-xl p-8 md:p-12 overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src={logo}
            alt="Logo"
            className="h-12 w-auto mx-auto mb-1 object-contain"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 text-sm">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" encType="multipart/form-data" noValidate>
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <label htmlFor="avatarUpload" className="cursor-pointer relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover border shadow"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 border rounded-full flex items-center justify-center text-gray-400 shadow">
                  <FaUser size={28} />
                </div>
              )}
              <input
                type="file"
                id="avatarUpload"
                accept="image/*"
                {...avatarRegister}
                onChange={(e) => handleAvatarChange(e, avatarRegister.onChange)}
                className="hidden"
              />
            </label>
            <div>
              <p className="text-sm font-medium">Upload Avatar <span className="text-red-500">*</span></p>
              {errors.avatar && <p className="text-xs text-red-500">{errors.avatar.message}</p>}
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {inputFields.map(({ label, name, type = "text", icon }) => (
              <div key={name}>
                <label htmlFor={`input_${name}`} className="text-sm font-medium text-gray-700 mb-1 block">
                  {label}{schema.fields[name]?.exclusiveTests?.required && <span className="text-red-500"> *</span>}
                </label>
                <div className="flex items-center px-4 py-3 rounded-xl border shadow-sm gap-2 bg-white">
                  {icon}
                  {type === "select" ? (
                    <select
                      id={`input_${name}`}
                      {...register(name)}
                      className="flex-1 outline-none text-sm bg-transparent"
                      defaultValue=""
                    >
                      <option value="" disabled>Select {label}</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <input
                      id={`input_${name}`}
                      type={type}
                      {...register(name)}
                      placeholder={`Enter your ${label.toLowerCase()}`}
                      className="flex-1 outline-none text-sm bg-transparent"
                    />
                  )}
                </div>
                {errors[name] && (
                  <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>
                )}
              </div>
            ))}
          </div>

          {/* Password & Confirm Password */}
          {["password", "confirmPassword"].map((field, idx) => (
            <div key={field}>
              <label htmlFor={`input_${field}`} className="text-sm font-medium text-gray-700 mb-1 block">
                {field === "password" ? "Password" : "Confirm Password"} <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center px-4 py-3 bg-white rounded-xl border shadow-sm gap-2">
                <FaLock className="text-purple-600" />
                <input
                  id={`input_${field}`}
                  type={showPassword ? "text" : "password"}
                  {...register(field)}
                  placeholder={`Enter your ${field === "password" ? "" : "confirm "}password`}
                  className="flex-1 outline-none text-sm bg-transparent"
                />
                {field === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                )}
              </div>
              {errors[field] && (
                <p className="text-xs text-red-500 mt-1">{errors[field].message}</p>
              )}
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg hover:opacity-90 transition disabled:opacity-60 transform will-change-transform translate-y-0 active:translate-y-px"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;