import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ element, requiredRole = null }) {
  // Get auth token and user data from localStorage
  const authToken = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  console.log('ProtectedRoute - Checking access...');
  console.log('ProtectedRoute - Auth Token:', authToken ? 'Present' : 'Missing');
  console.log('ProtectedRoute - User String:', userStr);
  
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
  }

  console.log('ProtectedRoute - Parsed User:', user);
  console.log('ProtectedRoute - Required Role:', requiredRole);

  // Check if user is authenticated
  if (!authToken || !user) {
    console.log('ProtectedRoute - BLOCK: No auth token or user data, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role (tolerant of different formats)
  if (requiredRole) {
    const userRole = user.role || '';
    console.log(`ProtectedRoute - Checking role: user.role="${userRole}" vs requiredRole="${requiredRole}"`);
    
    // Support both formats: "admin" and "ROLE_ADMIN"
    const userRoles = userRole.split(',').map(r => r.trim());
    const hasRole = userRoles.includes(requiredRole) || 
                    userRoles.includes(`ROLE_${requiredRole.toUpperCase()}`) ||
                    userRoles.some(r => r.toLowerCase() === requiredRole.toLowerCase());
    
    if (!hasRole) {
      console.log(`ProtectedRoute - BLOCK: User role ${userRole} does not match required role ${requiredRole}, redirecting to home`);
      return <Navigate to="/" replace />;
    }
  }

  console.log('ProtectedRoute - ALLOW: User authenticated with correct role');
  return element;
}
