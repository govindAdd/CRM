import LoginForm from '../components/forms/LoginForm';
import AnimatedLogo from "../components/AnimatedLogo";
import FormGoogleLogin from "../components/forms/FormGoogleLogin";

const LoginPage = () => {



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">

        <LoginForm />
        {/* <FormGoogleLogin /> */}

    </div>
  );
};

export default LoginPage;
