import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setInitializing } from '../store/authSlice';
import { fetchCurrentUser } from '../store/userSlice';
import api from '../services/axios';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Try to fetch current user to validate token
          const response = await api.get('/users/getCurrentUser');
          
          if (response.data?.data) {
            // Token is valid, restore auth state
            dispatch(setUser(response.data.data));
            dispatch(fetchCurrentUser());
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
            dispatch(setInitializing(false));
          }
        } else {
          // No token found, mark as not initializing
          dispatch(setInitializing(false));
        }
      } catch (error) {
        // Token is invalid or expired, clear it
        console.log('Auth initialization failed:', error.message);
        localStorage.removeItem('authToken');
        dispatch(setInitializing(false));
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Show loading or nothing while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthInitializer; 