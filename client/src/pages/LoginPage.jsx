import LoginForm from '../components/forms/LoginForm';
import { useEffect, useState } from 'react';
import AnimatedLogo from "../components/AnimatedLogo";
import FormGoogleLogin from "../components/forms/FormGoogleLogin";



const LoginPage = () => {
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {showLogo ? 
      <AnimatedLogo /> : 
      <LoginForm />
      // <FormGoogleLogin />
      }
    </div>
  );
};

export default LoginPage;