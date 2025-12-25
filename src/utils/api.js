// API Configuration
// Note: Auth endpoints bypass proxy and go directly to backend to avoid JWT filter
// Other API endpoints use /api prefix which will be proxied to localhost:8080 by setupProxy.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || '';
export const BACKEND_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  LOGIN: `${BACKEND_URL}/auth/login`,  // Direct to backend (no /api prefix)
  REGISTER: `${BACKEND_URL}/auth/register`,  // Direct to backend (no /api prefix)
  USER_PROFILE: '/api/users/profile',
  GET_PRODUCTS: '/api/admin/products/json',
  ADD_PRODUCT_JSON: '/api/admin/products/json',
  USER_COUNT: '/api/admin/users/count',  // Get total user count for admin dashboard
};

// Helper function for API requests with proper error handling
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      // If response is not JSON, that's okay
      data = { message: 'Success' };
    }

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
