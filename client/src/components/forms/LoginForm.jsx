import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaUser, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useLogin from "../../hooks/user/useLogin";
import bannerImage from "../../assets/banner-image.png";
import useCompanyInfo from "../../hooks/info/useCompanyInfo";

const LoginForm = () => {
  const { register, handleSubmit } = useForm();
  const { handleLogin, loading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const { companyInfo } = useCompanyInfo();
  const onSubmit = async (data) => {
    try {
      await handleLogin(data);
    } catch (err) {
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center relative dark:bg-gray-900 transition-colors"
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      {/* Glass blur overlay */}
      <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-sm z-0 transition-colors" />

      <div className="relative z-10 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden transition-colors">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 p-10">
          {/* Logo + Branding */}
          <div className="flex flex-col items-center mb-8">
            <img src={companyInfo?.LOGO_URL} alt="Logo" className="h-16 object-contain mb-1" />
            <span className="text-2xl font-semibold text-gray-800 dark:text-gray-100 font-god tracking-wider">
              {companyInfo?.FNAME} <span className="text-[#FF9100]">{companyInfo?.LNAME}</span>
            </span>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2 font-god tracking-wider">Hello!</h1>
            <p className="text-gray-500 dark:text-gray-300 text-sm font-digi">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block font-digi">
                E-mail
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 transition-colors">
                <FaUser className="text-purple-500" />
                <input
                  type="text"
                  {...register("email")}
                  required
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block font-digi">
                Password
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 transition-colors">
                <FaLock className="text-purple-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  required
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="text-right mt-1">
                <a href="/forgot-password" className="text-xs text-purple-500 hover:underline font-digi">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input type="checkbox" className="accent-purple-500 font-digi" />
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-md font-semibold text-sm hover:opacity-90 transition disabled:opacity-60 font-digi"
            >
              {loading ? "Logging in..." : "SIGN IN"}
            </button>
          </form>

          {/* Register */}
          <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-300 font-digi">
            Don't have an account?{" "}
            <a href="/signup" className="text-purple-500 dark:text-purple-400 font-medium hover:underline font-digi">
              Create Account
            </a>
          </div>
        </div>

        {/* Right Welcome Panel */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-[#6b21a8] to-[#3b82f6] dark:from-purple-700 dark:to-blue-800 items-center justify-center relative text-white p-10 transition-colors">
          <div className="z-10 text-center">
            <h2 className="text-4xl font-bold mb-4 font-beach tracking-widest">Welcome Back!</h2>
            <p className="text-base font-light max-w-xs mx-auto font-beach tracking-widest">
              Welcome back! Log in to manage your tasks, team, and goals all in
              one place.
            </p>
          </div>

          {/* Optional blurred cloud effect */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-white rounded-b-[50%] z-0 blur-2xl opacity-10 dark:bg-gray-700" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-white rounded-t-[50%] z-0 blur-2xl opacity-10 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
