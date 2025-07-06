import { useForm } from "react-hook-form";
import useForgotPassword from "../../hooks/user/useForgotPassword";
import bannerImage from "../../assets/banner-image.png";
import logo from "../../assets/logoNew.png";
import { FaEnvelope } from "react-icons/fa";

const ForgotPasswordForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { handleForgotPassword, loading } = useForgotPassword();

  const onSubmit = (data) => handleForgotPassword(data.email);

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
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-sm text-gray-500">We'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">E-mail <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <FaEnvelope className="text-blue-500" />
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder="Enter your email"
                className="flex-1 bg-transparent outline-none text-sm"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1" role="alert">{errors.email.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md font-semibold text-sm hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
