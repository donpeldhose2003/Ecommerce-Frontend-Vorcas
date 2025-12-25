import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftOnRectangleIcon,
  PlusIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { API_ENDPOINTS } from '../../../utils/api';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    originalPrice: '',
    discountPercent: '',
    finalPrice: '',
    stockQuantity: '',
    colors: '',
    sizes: '',
    materials: '',
    careInstructions: '',
    gender: '',
    featured: false,
    newArrivals: false,
    bestseller: false,
    sale: false,
    limitedEdition: false,
  });

  useEffect(() => {
    if (authChecked) return; // Only check auth once

    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!authToken || !userData) {
      setAuthChecked(true);
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    const userRole = parsedUser.role || (parsedUser.roles && parsedUser.roles[0]);

    if (userRole !== 'admin' && userRole !== 'ROLE_ADMIN') {
      setAuthChecked(true);
      navigate('/');
      return;
    }

    setUser(parsedUser);
    setAuthChecked(true);
    setLoading(false);
  }, [navigate, authChecked]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateFinalPrice = (original, discount) => {
    if (!original || !discount) return '';
    return (original - (original * discount) / 100).toFixed(2);
  };

  useEffect(() => {
    if (formData.originalPrice && formData.discountPercent) {
      const finalPrice = calculateFinalPrice(
        parseFloat(formData.originalPrice),
        parseFloat(formData.discountPercent)
      );
      setFormData((prev) => ({
        ...prev,
        finalPrice,
      }));
    }
  }, [formData.originalPrice, formData.discountPercent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
        setErrorMessage('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      console.log('Token being sent:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

      const productPayload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subCategory: formData.subCategory,
        originalPrice: parseFloat(formData.originalPrice),
        discountPercent: parseFloat(formData.discountPercent),
        finalPrice: parseFloat(formData.finalPrice),
        stockQuantity: parseInt(formData.stockQuantity, 10),
        colors: formData.colors.split(',').map((c) => c.trim()),
        sizes: formData.sizes.split(',').map((s) => s.trim()),
        materials: formData.materials,
        careInstructions: formData.careInstructions,
        gender: formData.gender,
        featured: formData.featured,
        newArrivals: formData.newArrivals,
        bestseller: formData.bestseller,
        sale: formData.sale,
        limitedEdition: formData.limitedEdition,
      };

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token}`,
      };

      console.log('Request headers:', { Authorization: headers.Authorization.substring(0, 20) + '...' });
      console.log('Request body:', productPayload);

      // Prefer proxied endpoint; fallback to direct backend URL if needed
      const url = API_ENDPOINTS.ADD_PRODUCT_JSON || '/api/admin/products/json';
      let response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(productPayload),
      });

      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', Array.from(response.headers.entries()));

      // Fallback: if proxied request returns 401 or 4xx/5xx, try direct backend URL
      if (!response.ok && response.status >= 400) {
        try {
          const directUrl = `${window.location.origin.includes('localhost') ? 'http://localhost:8080' : ''}/admin/products/json`;
          console.log('Retrying direct backend URL:', directUrl);
          const directResponse = await fetch(directUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(productPayload),
          });
          console.log('Direct API Response Status:', directResponse.status);
          
          // Use direct response if it's better than proxied
          if (directResponse.ok || directResponse.status < response.status) {
            response = directResponse;
          }
        } catch (retryErr) {
          console.error('Direct backend retry failed:', retryErr);
        }
      }

      // Parse response body once
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = { message: text };
        }
      }
      console.log('API Response Body:', responseData);

      if (response && response.ok) {
        setSuccessMessage('Product added successfully!');
        setFormData({
          name: '',
          description: '',
          category: '',
          subCategory: '',
          originalPrice: '',
          discountPercent: '',
          finalPrice: '',
          stockQuantity: '',
          colors: '',
          sizes: '',
          materials: '',
          careInstructions: '',
          gender: '',
          featured: false,
          newArrivals: false,
          bestseller: false,
          sale: false,
          limitedEdition: false,
        });
        setShowForm(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        if (response && (response.status === 401 || response.status === 403)) {
          setErrorMessage('Unauthorized: Invalid or expired token. Please log out and log back in, then try again.');
          // Do not auto-redirect; let the user re-login manually to avoid loop
          return;
        }
        // Show detailed error from backend
        const errorMsg = responseData?.message || responseData?.error || 'Failed to add product';
        setErrorMessage(`Error ${response.status}: ${errorMsg}`);
        console.error('Backend error:', responseData);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setErrorMessage('Error adding product. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          <p className="text-lg text-gray-600">Loading...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Add Products</h1>
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
        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Add Product Section */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {showForm ? 'Add New Product' : 'Add Products'}
            </h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <PlusIcon className="h-5 w-5" />
                Add Product
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Wireless Headphones"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Electronics"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Category
                  </label>
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Audio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Product description..."
                />
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price ($) *
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%) *
                    </label>
                    <input
                      type="number"
                      name="discountPercent"
                      value={formData.discountPercent}
                      onChange={handleInputChange}
                      required
                      step="0.1"
                      max="100"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Final Price ($)
                    </label>
                    <input
                      type="number"
                      name="finalPrice"
                      value={formData.finalPrice}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Stock & Attributes */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Stock & Attributes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Colors (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="colors"
                      value={formData.colors}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Black, Blue, Red"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sizes (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="sizes"
                      value={formData.sizes}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., S, M, L, XL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Materials
                    </label>
                    <input
                      type="text"
                      name="materials"
                      value={formData.materials}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Cotton, Polyester"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Care Instructions
                  </label>
                  <input
                    type="text"
                    name="careInstructions"
                    value={formData.careInstructions}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Wash with cold water"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Product Tags</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="newArrivals"
                      checked={formData.newArrivals}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">New Arrivals</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="bestseller"
                      checked={formData.bestseller}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Bestseller</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="sale"
                      checked={formData.sale}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Sale</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="limitedEdition"
                      checked={formData.limitedEdition}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Limited Edition</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Adding Product...' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Products Heading Only */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;
