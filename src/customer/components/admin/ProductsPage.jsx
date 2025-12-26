import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftOnRectangleIcon,
  PlusIcon,
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
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
  const [products, setProducts] = useState([]); // Store fetched products
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Track product being edited

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
    
    // Fetch products
    fetchProducts(authToken);
  }, [navigate, authChecked]);

  const fetchProducts = async (token) => {
    setLoadingProducts(true);
    try {
      const response = await fetch(API_ENDPOINTS.GET_PRODUCTS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const productList = Array.isArray(data) ? data : (data.products || []);
        setProducts(productList);
      } else {
        console.error('Failed to fetch products:', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'file') {
      // Handle file input
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
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

      // Build product JSON payload
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

      // Prefer multipart with product JSON part if image is present
      const formDataToSend = new FormData();
      formDataToSend.append('product', new Blob([JSON.stringify(productPayload)], { type: 'application/json' }));
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const headers = {
        'Authorization': `Bearer ${token.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token}`,
      };

      // Determine if we're editing or adding
      const isEditing = editingProduct !== null;
      const url = isEditing 
        ? `http://localhost:8080/api/admin/products/${editingProduct.id}`
        : (API_ENDPOINTS.ADD_PRODUCT_JSON || '/api/admin/products/json');
      
      const method = isEditing ? 'PUT' : 'POST';

      let response = await fetch(url, {
        method,
        headers,
        body: formDataToSend,
      });

      if (!response.ok && !isEditing) {
        // Fallback to direct backend URL with multipart
        const directUrl = 'http://localhost:8080/admin/products/json';
        let directResponse;
        try {
          directResponse = await fetch(directUrl, {
            method: 'POST',
            headers,
            body: formDataToSend,
          });
        } catch (_) {}
        if (directResponse && directResponse.ok) {
          response = directResponse;
        } else {
          // Final fallback: send pure JSON (no image) to match "json" endpoint
          const jsonHeaders = {
            'Content-Type': 'application/json',
            'Authorization': headers.Authorization,
          };
          const jsonResp = await fetch(API_ENDPOINTS.ADD_PRODUCT_JSON, {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify(productPayload),
          });
          if (jsonResp.ok) {
            response = jsonResp;
          }
        }
      }

      let responseData;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const txt = await response.text();
        try { responseData = JSON.parse(txt); } catch { responseData = { message: txt }; }
      }

      if (response.ok) {
        setSuccessMessage(isEditing ? 'Product updated successfully!' : 'Product added successfully!');
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
        setImageFile(null);
        setImagePreview(null);
        setEditingProduct(null);
        setShowForm(false);
        setTimeout(() => setSuccessMessage(''), 3000);

        const freshToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (freshToken) fetchProducts(freshToken);
      } else {
        const status = response.status;
        if (status === 401 || status === 403) {
          setErrorMessage('Unauthorized: please re-login and try again.');
        } else {
          const msg = responseData?.message || responseData?.error || `Failed to ${isEditing ? 'update' : 'add'} product`;
          setErrorMessage(`Error ${status}: ${msg}`);
          if (imageFile && !isEditing) {
            // Hint: backend may only accept JSON at this endpoint
            setErrorMessage((prev) => prev + ' (Image upload may require a multipart endpoint; product was not saved with image.)');
          }
        }
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setErrorMessage('Error saving product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        setErrorMessage('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.startsWith('Bearer ') ? token.replace(/^Bearer\s+/i, '') : token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccessMessage('Product deleted successfully!');
        // Remove product from local state
        setProducts(products.filter(p => p.id !== productId));
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(`Failed to delete product: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setErrorMessage('Error deleting product. Please try again.');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      subCategory: product.subCategory || '',
      originalPrice: product.originalPrice || '',
      discountPercent: product.discountPercent || '',
      finalPrice: product.finalPrice || '',
      stockQuantity: product.stockQuantity || '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      materials: product.materials || '',
      careInstructions: product.careInstructions || '',
      gender: product.gender || '',
      featured: product.featured || false,
      newArrivals: product.newArrivals || false,
      bestseller: product.bestseller || false,
      sale: product.sale || false,
      limitedEdition: product.limitedEdition || false,
    });
    setImagePreview(product.imagePath || null);
    setShowForm(true);
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
      {/* Enhanced Header */}
      <header className="bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin')} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700" title="Back to Dashboard">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <p className="text-gray-500 text-sm font-medium">Admin Dashboard</p>
                <h1 className="text-gray-900 text-2xl font-bold">Products Management</h1>
              </div>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-sm font-medium">Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
              {/* Pricing */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Add Product Button */}
        <div className="mb-8 flex justify-end">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Add New Product
            </button>
          )}
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
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
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

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

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {imagePreview && (
                    <div className="flex items-center gap-2">
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-300" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
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
                  {submitting ? (editingProduct ? 'Updating Product...' : 'Adding Product...') : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
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
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Products List</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your products here</p>
          </div>

          {loadingProducts ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No products added yet. Click "Add New Product" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">{product.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{product.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Rs.{product.finalPrice || product.originalPrice}
                          </p>
                          {product.discountPercent && (
                            <p className="text-xs text-red-600">{product.discountPercent}% off</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            product.stockQuantity > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm font-medium"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition text-sm font-medium"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;
