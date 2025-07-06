import { useForm } from "react-hook-form";
import useResetPassword from "../../hooks/user/useResetPassword";
import bannerImage from "../../assets/banner-image.png";
import logo from "../../assets/logoNew.png";
import { FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";

const ResetPasswordForm = ({ token }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { handleResetPassword, loading } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = (data) => handleResetPassword({ ...data, token });

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      {/* Optional glass blur overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-0" />

      <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Logo + Title */}
        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="h-16 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-sm text-gray-500">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <FaLock className="text-purple-500" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                placeholder="Enter new password"
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <FaLock className="text-green-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", { required: "Please confirm your password" })}
                placeholder="Confirm password"
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-gradient-to-r from-purple-500 to-green-500 rounded-xl shadow-md font-semibold text-sm hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
