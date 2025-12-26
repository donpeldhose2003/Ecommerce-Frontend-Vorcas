import React, { useState, useEffect } from 'react'
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import { API_ENDPOINTS } from '../../../utils/api'

// Map API response to frontend format
const mapApiProductToFrontend = (apiProduct) => {
  return {
    id: apiProduct.id,
    productName: apiProduct.name,
    productPrice: apiProduct.originalPrice,
    discountPrice: apiProduct.finalPrice,
    productImage: apiProduct.imagePath || '/fashion.avif',
    productDescription: apiProduct.description || '',
    color: apiProduct.colors?.[0] || 'N/A',
    sizes: apiProduct.sizes || [],
    category: apiProduct.category || '',
  }
}

const ProductDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState(location.state?.product || null)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(!location.state?.product)
  const [error, setError] = useState(null)

  // Fetch product from API if not passed via state
  useEffect(() => {
    if (product) {
      // Product passed via navigation state
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0])
      }
      return
    }

    // Fetch product from API
    const fetchProductDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get token from localStorage or sessionStorage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        
        const headers = {
          'Content-Type': 'application/json',
        }
        
        if (token) {
          // Ensure token has Bearer prefix
          const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`
          headers['Authorization'] = authToken
        }
        
        const response = await fetch(`${API_ENDPOINTS.GET_PRODUCTS}`, {
          headers,
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (Array.isArray(data)) {
          const foundProduct = data.find(p => p.id === parseInt(id))
          if (foundProduct) {
            const mappedProduct = mapApiProductToFrontend(foundProduct)
            setProduct(mappedProduct)
            if (mappedProduct.sizes && mappedProduct.sizes.length > 0) {
              setSelectedSize(mappedProduct.sizes[0])
            }
          } else {
            setError('Product not found')
          }
        }
      } catch (err) {
        setError('Failed to load product details')
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [id, product])

  if (loading) {
    return (
      <div className='px-5 lg:px-20 py-10 text-center'>
        <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        <p className='text-gray-600 mt-4'>Loading product details...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className='px-5 lg:px-20 py-10 text-center'>
        <p className='text-gray-600 mb-4'>{error || 'Product details not available.'}</p>
        <Link to='/products' className='text-blue-600 hover:underline'>Back to products</Link>
      </div>
    )
  }
  
  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert('Please select a size')
      return
    }
    
    addToCart({ ...product, selectedSize }, quantity)
    alert(`Added ${quantity} ${product.productName} to cart!`)
    setQuantity(1)
  }

  const decrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const increment = () => {
    setQuantity((prev) => prev + 1)
  }

  return (
    <div className='px-5 lg:px-20 py-10'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='w-full h-96 bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center'>
          {product.productImage ? (
            <img
              className='w-full h-full object-cover'
              src={product.productImage}
              alt={product.productName}
            />
          ) : (
            <div className='text-center text-gray-400'>
              <svg className='w-24 h-24 mx-auto mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
              <p className='text-lg'>No Image Available</p>
            </div>
          )}
        </div>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 mb-3'>{product.productName}</h1>
          <div className='flex items-center gap-3 mb-4'>
            {product.discountPrice ? (
              <>
                <span className='text-blue-600 font-bold text-2xl'>Rs. {product.discountPrice}</span>
                <span className='text-gray-400 line-through'>Rs. {product.productPrice}</span>
              </>
            ) : (
              <span className='text-blue-600 font-bold text-2xl'>Rs. {product.productPrice}</span>
            )}
          </div>
          <p className='text-sm text-gray-600 mb-4'>{product.productDescription}</p>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Select Size *</label>
              <div className='flex flex-wrap gap-2'>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Quantity</label>
            <div className='flex items-center border border-gray-300 rounded-md overflow-hidden w-fit'>
              <button onClick={decrement} className='px-3 py-2 text-gray-700 hover:bg-gray-100'>−</button>
              <span className='px-4 py-2 text-gray-800'>{quantity}</span>
              <button onClick={increment} className='px-3 py-2 text-gray-700 hover:bg-gray-100'>+</button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className='flex items-center gap-3 mb-4'>
            <button
              onClick={handleAddToCart}
              className='px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium'
            >
              Add to Cart
            </button>
            <Link to='/products' className='px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium'>
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
