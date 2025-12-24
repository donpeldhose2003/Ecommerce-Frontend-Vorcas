import React, { useState } from 'react'
import { useCart } from '../../../context/CartContext'
import { useNavigate, Link } from 'react-router-dom'

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  })

  const [errors, setErrors] = useState({})

  if (cartItems.length === 0) {
    return (
      <div className='px-5 lg:px-20 py-10'>
        <div className='text-center py-20'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>Your cart is empty</h2>
          <p className='text-gray-600 mb-6'>Add some products before checking out!</p>
          <Link
            to='/products'
            className='inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Phone number must be at least 10 digits'
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
    } else if (!/^\d{5,6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 5-6 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // In production, send order to backend API
      console.log('Order submitted:', {
        deliveryInfo: formData,
        items: cartItems,
        total: getCartTotal(),
      })

      // Show success message
      alert('Order placed successfully!')
      
      // Clear cart and redirect
      clearCart()
      navigate('/')
    }
  }

  return (
    <div className='px-5 lg:px-20 py-10'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Checkout</h1>
        <p className='text-gray-600'>Complete your purchase</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Delivery Information Form */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-6'>Delivery Information</h2>

              {/* Contact Information */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Contact Information</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='firstName' className='block text-sm font-medium text-gray-700 mb-1'>
                      First Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      id='firstName'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder='John'
                    />
                    {errors.firstName && <p className='text-red-500 text-xs mt-1'>{errors.firstName}</p>}
                  </div>

                  <div>
                    <label htmlFor='lastName' className='block text-sm font-medium text-gray-700 mb-1'>
                      Last Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      id='lastName'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder='Doe'
                    />
                    {errors.lastName && <p className='text-red-500 text-xs mt-1'>{errors.lastName}</p>}
                  </div>

                  <div>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                      Email <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder='john.doe@example.com'
                    />
                    {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-1'>
                      Phone Number <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='tel'
                      id='phone'
                      name='phone'
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder='1234567890'
                    />
                    {errors.phone && <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Shipping Address</h3>
                <div className='space-y-4'>
                  <div>
                    <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-1'>
                      Street Address <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      id='address'
                      name='address'
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder='123 Main Street'
                    />
                    {errors.address && <p className='text-red-500 text-xs mt-1'>{errors.address}</p>}
                  </div>

                  <div>
                    <label htmlFor='apartment' className='block text-sm font-medium text-gray-700 mb-1'>
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type='text'
                      id='apartment'
                      name='apartment'
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Apt 4B'
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label htmlFor='city' className='block text-sm font-medium text-gray-700 mb-1'>
                        City <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        id='city'
                        name='city'
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder='New York'
                      />
                      {errors.city && <p className='text-red-500 text-xs mt-1'>{errors.city}</p>}
                    </div>

                    <div>
                      <label htmlFor='state' className='block text-sm font-medium text-gray-700 mb-1'>
                        State <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        id='state'
                        name='state'
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder='NY'
                      />
                      {errors.state && <p className='text-red-500 text-xs mt-1'>{errors.state}</p>}
                    </div>

                    <div>
                      <label htmlFor='postalCode' className='block text-sm font-medium text-gray-700 mb-1'>
                        Postal Code <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        id='postalCode'
                        name='postalCode'
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.postalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder='10001'
                      />
                      {errors.postalCode && <p className='text-red-500 text-xs mt-1'>{errors.postalCode}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor='country' className='block text-sm font-medium text-gray-700 mb-1'>
                      Country
                    </label>
                    <select
                      id='country'
                      name='country'
                      value={formData.country}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='United States'>United States</option>
                      <option value='Canada'>Canada</option>
                      <option value='United Kingdom'>United Kingdom</option>
                      <option value='Australia'>Australia</option>
                      <option value='India'>India</option>
                      <option value='Other'>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className='lg:col-span-1'>
            <div className='bg-gray-50 rounded-lg p-6 sticky top-4'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>Order Summary</h2>

              <div className='space-y-3 mb-4 max-h-64 overflow-y-auto'>
                {cartItems.map((item) => {
                  const itemPrice = parseFloat(item.discountPrice || item.productPrice)
                  const itemTotal = itemPrice * item.quantity
                  return (
                    <div key={`${item.id}-${item.size}-${item.color}`} className='flex gap-3'>
                      <div className='w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0'>
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 truncate'>{item.productName}</p>
                        <p className='text-xs text-gray-600'>
                          {item.color} • {item.size}
                        </p>
                        <p className='text-xs text-gray-700'>
                          Qty: {item.quantity} x ${itemPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className='text-sm font-medium text-gray-900'>${itemTotal.toFixed(2)}</div>
                    </div>
                  )
                })}
              </div>

              <div className='space-y-2 mb-6 pt-4 border-t border-gray-300'>
                <div className='flex justify-between text-gray-600'>
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-gray-600'>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className='flex justify-between text-gray-600'>
                  <span>Tax</span>
                  <span>${(getCartTotal() * 0.1).toFixed(2)}</span>
                </div>
                <div className='border-t border-gray-300 pt-2 flex justify-between text-lg font-bold text-gray-900'>
                  <span>Total</span>
                  <span>${(getCartTotal() * 1.1).toFixed(2)}</span>
                </div>
              </div>

              <button
                type='submit'
                className='w-full mb-3 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold'
              >
                Place Order
              </button>

              <Link
                to='/cart'
                className='block text-center text-blue-600 hover:text-blue-700 text-sm'
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout
