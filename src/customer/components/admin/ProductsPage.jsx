import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftOnRectangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (!authToken || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    const userRole = parsedUser.role || (parsedUser.roles && parsedUser.roles[0]);

    if (userRole !== 'admin' && userRole !== 'ROLE_ADMIN') {
      navigate('/');
      return;
    }

    setUser(parsedUser);
    loadProducts(authToken);
  }, [navigate]);

  const loadProducts = async (token) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        // Fallback to mock data
        loadMockProducts();
      }
    } catch (error) {
      console.log('Using mock products');
      loadMockProducts();
    } finally {
      setLoading(false);
    }
  };

  const loadMockProducts = () => {
    setProducts([
      { id: 1, name: 'Wireless Headphones', category: 'Electronics', brand: 'Apple', price: 199, stock: 25, discount: 10, topSelling: true },
      { id: 2, name: 'Running Shoes', category: 'Sports', brand: 'Nike', price: 89, stock: 8, discount: 15 },
      { id: 3, name: 'Cotton T-Shirt', category: 'Fashion', brand: 'Nike', price: 29, stock: 45, discount: 5 },
      { id: 4, name: 'Smartphone', category: 'Electronics', brand: 'Samsung', price: 599, stock: 3, discount: 20 },
      { id: 5, name: 'Yoga Mat', category: 'Sports', brand: 'Sony', price: 45, stock: 20, discount: 0 },
      { id: 6, name: 'Winter Jacket', category: 'Fashion', brand: 'Nike', price: 159, stock: 12, discount: 12 },
      { id: 7, name: 'Backpack', category: 'Fashion', brand: 'Apple', price: 79, stock: 35, discount: 8 },
      { id: 8, name: 'Coffee Maker', category: 'Home & Living', brand: 'Sony', price: 89, stock: 2, discount: 18 },
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition"
            >
              <ArrowLeftIcon className="h-6 w-6" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">All Products</h2>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              <PlusIcon className="h-5 w-5" />
              Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.brand}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">${product.price}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        product.stock > 20 ? 'bg-green-100 text-green-700' :
                        product.stock > 5 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.discount}%</td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-800 p-1" title="Delete">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;
