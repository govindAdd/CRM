import { useParams } from "react-router-dom";
import ResetPasswordForm from "../components/forms/ResetPasswordForm";

const ResetPasswordPage = () => {
  const { token } = useParams();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ResetPasswordForm token={token} />
    </div>
  );
};

export default ResetPasswordPage;
