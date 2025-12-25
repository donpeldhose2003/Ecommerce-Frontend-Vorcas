import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../../utils/api';

const SAMPLE_ORDERS = [
  { id: 'ORD-2045', customer: 'John Doe', total: 320, status: 'Pending', date: '2025-12-22' },
  { id: 'ORD-2044', customer: 'Alice Smith', total: 189, status: 'Delivered', date: '2025-12-21' },
  { id: 'ORD-2043', customer: 'Robert Fox', total: 420, status: 'Shipped', date: '2025-12-21' },
  { id: 'ORD-2042', customer: 'Emily Davis', total: 255, status: 'Delivered', date: '2025-12-20' },
  { id: 'ORD-2041', customer: 'Michael Brown', total: 145, status: 'Pending', date: '2025-12-20' },
  { id: 'ORD-2040', customer: 'Karen Hill', total: 510, status: 'Delivered', date: '2025-12-19' },
  { id: 'ORD-2039', customer: 'Lucas Green', total: 275, status: 'Returned', date: '2025-12-18' },
  { id: 'ORD-2038', customer: 'Sofia Miller', total: 330, status: 'Delivered', date: '2025-12-18' },
  { id: 'ORD-2037', customer: 'Ethan Lee', total: 195, status: 'Pending', date: '2025-12-17' },
];

const SAMPLE_ORDERS_TREND = [
  { label: 'Mon', count: 18, revenue: 2600 },
  { label: 'Tue', count: 21, revenue: 3100 },
  { label: 'Wed', count: 24, revenue: 3450 },
  { label: 'Thu', count: 20, revenue: 2900 },
  { label: 'Fri', count: 28, revenue: 4100 },
  { label: 'Sat', count: 32, revenue: 4800 },
  { label: 'Sun', count: 19, revenue: 2750 },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders] = useState(SAMPLE_ORDERS);
  const [userCount, setUserCount] = useState(0);
  const [ordersTrend] = useState(SAMPLE_ORDERS_TREND);
  const [fetchingUserCount, setFetchingUserCount] = useState(false);

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

    // Fetch user count from API
    fetchUserCount(authToken);
  }, [navigate]);

  const fetchUserCount = async (token) => {
    setFetchingUserCount(true);
    try {
      const response = await fetch(API_ENDPOINTS.USER_COUNT, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response formats: { count: 123 } or just a number
        const count = typeof data === 'number' ? data : (data.count || data.userCount || 0);
        setUserCount(count);
      } else {
        console.error('Failed to fetch user count:', response.status);
        setUserCount(0); // Fallback to 0 if fetch fails
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
      setUserCount(0); // Fallback to 0 on error
    } finally {
      setFetchingUserCount(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const goToProducts = () => {
    navigate('/admin/products');
  };

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const returns = orders.filter((o) => o.status === 'Returned').length;
    const totalEarnings = orders.reduce((sum, o) => sum + o.total, 0);
    const averageOrder = totalOrders ? Math.round(totalEarnings / totalOrders) : 0;
    return { totalOrders, pendingOrders, returns, totalEarnings, averageOrder };
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const counts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    return counts;
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">A</div>
            <div>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
              <p className="text-lg font-semibold text-gray-900">{user?.email || 'Admin'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToProducts}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
            >
              Manage Products
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <section>
          <div className="flex flex-col gap-2 mb-4">
            <p className="text-sm uppercase tracking-wide text-gray-500">Overview</p>
            <h1 className="text-3xl font-bold text-gray-900">Store performance snapshot</h1>
            <p className="text-gray-600">Key metrics across users, orders, and earnings with a quick trend view.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard title="Total Users" value={userCount.toLocaleString()} subtitle="Registered users" tone="indigo" />
            <MetricCard title="Total Orders" value={metrics.totalOrders} subtitle="All time" tone="emerald" />
            <MetricCard title="Pending Orders" value={metrics.pendingOrders} subtitle="Awaiting fulfillment" tone="amber" />
            <MetricCard title="Returns" value={metrics.returns} subtitle="Marked as returned" tone="rose" />
            <MetricCard title="Total Earnings" value={formatCurrency(metrics.totalEarnings)} subtitle="From all orders" tone="indigo" />
            <MetricCard title="Avg. Order Value" value={formatCurrency(metrics.averageOrder)} subtitle="Per completed order" tone="gray" />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OrdersChart trend={ordersTrend} />
          </div>
          <StatusBreakdown status={statusBreakdown} totalOrders={metrics.totalOrders} />
        </section>

        {/* Recent orders section removed per request */}
      </main>
    </div>
  );
};

export default AdminPage;

const MetricCard = ({ title, value, subtitle, tone = 'indigo' }) => {
  const toneMap = {
    indigo: 'border-indigo-100 bg-indigo-50 text-indigo-800',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-100 bg-amber-50 text-amber-800',
    rose: 'border-rose-100 bg-rose-50 text-rose-800',
    gray: 'border-gray-100 bg-gray-50 text-gray-800',
  };

  return (
    <div className={`rounded-xl border shadow-sm p-4 ${toneMap[tone] || toneMap.gray}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-sm mt-1 opacity-80">{subtitle}</p>}
    </div>
  );
};

const OrdersChart = ({ trend }) => {
  const maxCount = Math.max(...trend.map((t) => t.count), 1);
  const totalWeekOrders = trend.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Orders this week</h3>
          <p className="text-sm text-gray-600">Daily order volume with revenue hint</p>
        </div>
        <span className="text-sm font-semibold text-indigo-700">{totalWeekOrders} orders</span>
      </div>

      <div className="flex items-end gap-3 h-56">
        {trend.map((day) => {
          const height = Math.max((day.count / maxCount) * 100, 8);
          return (
            <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400"
                style={{ height: `${height}%` }}
                aria-label={`${day.count} orders`}
              ></div>
              <div className="text-xs text-gray-600">{day.label}</div>
              <div className="text-[11px] text-gray-400">{day.count} • {formatCurrency(day.revenue)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatusBreakdown = ({ status, totalOrders }) => {
  const statusEntries = Object.entries(status);
  const palette = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Returned: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order status</h3>
      <div className="space-y-3">
        {statusEntries.map(([label, count]) => {
          const percentage = totalOrders ? Math.round((count / totalOrders) * 100) : 0;
          return (
            <div key={label} className={`rounded-lg border px-3 py-3 flex items-center justify-between ${palette[label] || 'bg-gray-100 border-gray-200 text-gray-800'}`}>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs opacity-75">{percentage}% of orders</p>
              </div>
              <span className="text-lg font-bold">{count}</span>
            </div>
          );
        })}
        {statusEntries.length === 0 && <p className="text-sm text-gray-500">No orders yet.</p>}
      </div>
    </div>
  );
};

const formatCurrency = (value) => `$${value.toLocaleString()}`;

const statusPill = (status) => {
  const map = {
    Pending: 'bg-amber-100 text-amber-800',
    Delivered: 'bg-emerald-100 text-emerald-800',
    Shipped: 'bg-indigo-100 text-indigo-800',
    Returned: 'bg-rose-100 text-rose-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};
