import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../auth/LoginForm';
import { Check } from 'lucide-react';

const LoginPage = () => {
  const location = useLocation();
  const message = location.state?.message;

  // Clear message from location state after displaying
  useEffect(() => {
    if (message) {
      window.history.replaceState({}, document.title);
    }
  }, [message]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {message && (
        <div className="max-w-md w-full mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
          <Check className="mr-2 h-4 w-4" />
          {message}
        </div>
      )}
      <LoginForm />
    </div>
  );
};

export default LoginPage; 