import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@services/api';
import type { LoginRequest, AuthResponse, ApiError } from '@services/types/api.types';
import { ROUTES } from '@utils/constants';
import { useAppDispatch } from '@store/hooks';
import { setCredentials } from '@store/slices/authSlice';

export const useLoginLogic = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response: AuthResponse = await authApi.login(formData);
      
      // Verify token is received
      if (!response.accessToken) {
        setError('Authentication failed. Token not received.');
        return;
      }

      // Store credentials in Redux (this also persists to localStorage)
      dispatch(setCredentials({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      }));
      
      // Navigate to dashboard
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    showPassword,
    togglePasswordVisibility,
    handleInputChange,
    handleSubmit,
  };
};

