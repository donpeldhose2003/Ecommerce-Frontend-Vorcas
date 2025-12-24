import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'returns', label: 'Returns' },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (!authToken || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    const userRole = parsedUser.role || (parsedUser.roles && parsedUser.roles[0]);
    const isAdmin = userRole === 'admin' || userRole === 'ROLE_ADMIN';

    if (!isAdmin) {
      navigate('/');
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin top navbar */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">A</div>
            <div>
              <p className="text-sm text-gray-500">Welcome back</p>
              <p className="text-lg font-semibold text-gray-900">{user?.email || 'Admin'}</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 text-sm font-medium text-gray-600">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Content placeholder */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide text-gray-400 mb-2">Admin Section</p>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeTab}</h1>
            <p className="text-gray-600 mt-3">This area is ready for your {activeTab} content.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
