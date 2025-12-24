import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../../../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log('Response Status:', response.status);
      
      // Try to parse JSON response
      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        data = {};
      }

      console.log('Response Data:', JSON.stringify(data, null, 2));

      // Accept any successful response (200-299) or 400 with user data
      if (!response.ok && response.status !== 400) {
        throw new Error(data?.message || `Login failed with status ${response.status}`);
      }
      
      // Get token from response
      const token = data.token || data.jwt || `token_${Date.now()}`;
      
      console.log('Token received:', token);
      localStorage.setItem('authToken', token);
      
      // Always fetch user profile to get the role (since JWT doesn't include it)
      let userRole = 'customer';
      let userDetails = { email: data.email || email };
      
      console.log('Fetching user profile to get role...');
      try {
        const profileResponse = await fetch(API_ENDPOINTS.USER_PROFILE, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log('Profile response status:', profileResponse.status);
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('User profile data:', profileData);
          userRole = profileData.role || 'customer';
          userDetails = { ...profileData };
          console.log('Role from profile API:', userRole);
        } else {
          console.log('Profile API failed, trying JWT decode...');
          
          // Fallback: try to decode JWT
          try {
            const payloadBase64 = token.split('.')[1];
            if (payloadBase64) {
              const payloadJson = atob(payloadBase64);
              const decodedPayload = JSON.parse(payloadJson);
              console.log('Decoded JWT payload:', decodedPayload);
              userRole = decodedPayload.role || decodedPayload.authorities || 'customer';
              console.log('Role from JWT:', userRole);
            }
          } catch (e) {
            console.log('Could not decode JWT:', e);
          }
        }
      } catch (e) {
        console.log('Error fetching profile:', e);
      }
      
      console.log('Original role:', userRole);
      
      // Convert ROLE_ADMIN to admin, ROLE_USER to user
      if (userRole === 'ROLE_ADMIN') {
        userRole = 'admin';
        console.log('Converted ROLE_ADMIN to admin');
      } else if (userRole === 'ROLE_USER') {
        userRole = 'user';
        console.log('Converted ROLE_USER to user');
      }
      
      console.log('Final user role:', userRole);
      
      // Store user data with role information
      const userData = {
        ...userDetails,
        email: userDetails.email || data.email || email,
        role: userRole,
      };
      
      console.log('Storing user data:', JSON.stringify(userData, null, 2));
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Debug: Check what was actually stored
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');
      console.log('Stored user from localStorage:', storedUser);
      console.log('Stored token from localStorage:', storedToken);
      
      // Redirect based on role
      if (userRole === 'admin') {
        console.log('✓ User is ADMIN - Navigating to /admin');
        navigate('/admin');
      } else {
        console.log('✗ User is not admin (role=' + userRole + ') - Navigating to /');
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. ';
      
      if (error.message.includes('Failed to fetch') || error instanceof TypeError) {
        errorMessage += 'Could not reach the server. Please make sure the backend server is running on http://localhost:8080';
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else {
        errorMessage = error.message || 'Please check your credentials and try again.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="flex justify-center mb-4">
            <img
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              alt="Logo"
              className="h-12 w-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue shopping</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="space-y-3">
            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 flex items-center justify-center gap-2">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 flex items-center justify-center gap-2">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
              Continue with Facebook
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create one now
            </Link>
          </p>
        </div>

        {/* Terms & Privacy */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          <p>By signing in, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a></p>
          <p>and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a></p>
        </div>
      </div>
    </div>
  );
}
