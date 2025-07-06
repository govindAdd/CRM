import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaUser, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useLogin from "../../hooks/user/useLogin";
import logo from "../../assets/logoNew.png";
import bannerImage from "../../assets/banner-image.png";

const FormGoogleLogin = () => {
  const { register, handleSubmit } = useForm();
  const { handleLogin, loading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      await handleLogin(data);
    } catch (err) {
      toast.error(err.message || "Login failed");
    }
  };

const handleGoogleLogin = () => {
  const baseURL = import.meta.env.VITE_SERVER_URL?.replace(/\/+$/, ""); // remove trailing slash if any

  if (!baseURL) {
    console.error("❌ VITE_SERVER_URL is not defined.");
    alert("Google login failed: Missing API base URL");
    return;
  }

  const googleURL = `${baseURL}/api/v1/auth/google`;
  console.log("🌐 Redirecting to:", googleURL);
  window.location.href = googleURL;
};

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-0" />

      <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 p-10">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Logo" className="h-16 object-contain mb-1" />
            <span className="text-xl font-semibold tracking-wide text-gray-800">
              add <span className="text-[#FF9100]">god</span>
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mt-2">Hello!</h1>
            <p className="text-gray-500 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                E-mail
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
                <FaUser className="text-purple-500" />
                <input
                  type="text"
                  {...register("email")}
                  required
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Password
              </label>
              <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
                <FaLock className="text-purple-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  required
                  placeholder="Enter your password"
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
              <div className="text-right mt-1">
                <a
                  href="/forgot-password"
                  className="text-xs text-purple-500 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="accent-purple-500" />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-md font-semibold text-sm hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "SIGN IN"}
            </button>

            <div className="relative text-center text-sm my-4">
              <span className="text-gray-400">or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 text-gray-600 text-sm w-full"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="w-5 h-5"
              />
              Sign in with Google
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-purple-500 font-medium hover:underline"
            >
              Create Account
            </a>
          </div>
        </div>

        <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-[#6b21a8] to-[#3b82f6] items-center justify-center relative text-white p-10">
          <div className="z-10 text-center">
            <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-base font-light max-w-xs mx-auto">
              Welcome back! Log in to manage your tasks, team, and goals all in
              one place.
            </p>
          </div>
          <div className="absolute top-0 left-0 right-0 h-24 bg-white rounded-b-[50%] z-0 blur-2xl opacity-10" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-white rounded-t-[50%] z-0 blur-2xl opacity-10" />
        </div>
      </div>
    </div>
  );
};

export default FormGoogleLogin;
