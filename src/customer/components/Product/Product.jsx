import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from './ProductCard'
import { apiCall, API_ENDPOINTS } from '../../../utils/api'

// Map API response to frontend product structure
const mapApiProductToFrontend = (apiProduct) => {
  console.log('Mapping product:', apiProduct.name, 'Image path from API:', apiProduct.imagePath)
  
  return {
    id: apiProduct.id,
    productName: apiProduct.name,
    productDescription: apiProduct.description,
    fullDescription: apiProduct.description,
    productImage: apiProduct.imagePath || null,
    productPrice: apiProduct.originalPrice.toString(),
    discountPrice: apiProduct.finalPrice.toString(),
    color: apiProduct.colors?.[0] || 'N/A',
    size: apiProduct.sizes?.[0] || 'OneSize',
    category: apiProduct.category,
    ...apiProduct, // Include all API fields for reference
  }
}

const Product = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    color: '',
    size: '',
    discount: '',
  })

  // Get category from URL, default to 'all' to show all products
  const category = searchParams.get('category') || 'all'

  useEffect(() => {
    fetchProducts(category)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  useEffect(() => {
    setFilteredProducts(applyFilters(products, filters))
  }, [products, filters])

  const fetchProducts = async (categoryFilter) => {
    try {
      setLoading(true)
      setSelectedCategory(categoryFilter)
      
      // Get token from localStorage or sessionStorage (optional for product browsing)
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add Authorization header only if token exists
      if (token) {
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`
        headers['Authorization'] = authToken
      }
      
      console.log('Fetching products from:', API_ENDPOINTS.GET_PRODUCTS)
      
      // Fetch from API
      const response = await fetch(API_ENDPOINTS.GET_PRODUCTS, {
        headers,
      })
      
      console.log('Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Raw API Response:', data)
      console.log('Is array?', Array.isArray(data))
      console.log('Number of products returned:', Array.isArray(data) ? data.length : 'Not an array')
      
      if (Array.isArray(data)) {
        console.log('First product:', data[0])
        console.log('All products:', data)
      }
      
      // Map API response to frontend format
      let mappedProducts = Array.isArray(data) 
        ? data.map(mapApiProductToFrontend)
        : [mapApiProductToFrontend(data)]
      
      console.log('Total mapped products:', mappedProducts.length)
      console.log('Product categories:', mappedProducts.map(p => ({ id: p.id, name: p.productName, category: p.category })))
      console.log('Category filter:', categoryFilter)
      
      // Only filter by category if it's not 'all' and not empty
      // This ensures we show all products by default
      if (categoryFilter && categoryFilter !== 'all' && categoryFilter.trim() !== '') {
        console.log('Applying category filter for:', categoryFilter)
        mappedProducts = mappedProducts.filter(
          p => p.category?.toLowerCase() === categoryFilter.toLowerCase()
        )
        console.log('After category filter:', mappedProducts.length)
      } else {
        console.log('Showing all products (no category filter)')
      }
      
      setProducts(mappedProducts)
      setFilteredProducts(applyFilters(mappedProducts, filters))
      setError(null)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(`Failed to load products: ${err.message}`)
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (list, activeFilters) => {
    let result = [...list]

    const parsePrice = (value) => {
      if (!value && value !== 0) return null
      const parsed = parseFloat(value)
      return Number.isNaN(parsed) ? null : parsed
    }

    const min = parsePrice(activeFilters.minPrice)
    const max = parsePrice(activeFilters.maxPrice)

    if (min !== null) {
      result = result.filter((p) => parsePrice(p.discountPrice || p.productPrice) >= min)
    }

    if (max !== null) {
      result = result.filter((p) => parsePrice(p.discountPrice || p.productPrice) <= max)
    }

    if (activeFilters.color) {
      result = result.filter((p) =>
        p.color?.toLowerCase().includes(activeFilters.color.toLowerCase())
      )
    }

    if (activeFilters.size) {
      result = result.filter((p) => p.size?.toLowerCase() === activeFilters.size.toLowerCase())
    }

    if (activeFilters.discount) {
      const minDiscount = parseInt(activeFilters.discount, 10)
      result = result.filter((p) => {
        const price = parsePrice(p.productPrice)
        const sale = parsePrice(p.discountPrice)
        if (price === null || sale === null) return false
        const percent = ((price - sale) / price) * 100
        return percent >= minDiscount
      })
    }

    return result
  }

  const getCategoryTitle = () => {
    const categoryTitles = {
      all: 'All Products',
      electronics: 'Electronics',
      clothing: 'Clothing',
      accessories: 'Accessories',
    }
    return categoryTitles[selectedCategory?.toLowerCase()] || 'Products'
  }

  const colorOptions = Array.from(new Set(products.map((p) => p.color).filter(Boolean)))
  const sizeOptions = Array.from(new Set(products.map((p) => p.size).filter(Boolean)))
  const discountOptions = [
    { label: 'Any discount', value: '' },
    { label: '10% or more', value: '10' },
    { label: '20% or more', value: '20' },
    { label: '30% or more', value: '30' },
    { label: '40% or more', value: '40' },
  ]

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', color: '', size: '', discount: '' })
  }

  return (
    <div className='px-5 lg:px-20 py-10'>
      <div className='mb-10 text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-3'>{getCategoryTitle()}</h1>
        <p className='text-gray-600 text-base'>Browse our collection</p>
      </div>

      <div className='mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='flex flex-col gap-2'>
          <label className='text-sm text-gray-700'>Price range (Rs.)</label>
          <div className='flex gap-2'>
            <input
              type='number'
              placeholder='Min'
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
            <input
              type='number'
              placeholder='Max'
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm text-gray-700'>Color</label>
          <select
            value={filters.color}
            onChange={(e) => handleFilterChange('color', e.target.value)}
            className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value=''>Any</option>
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm text-gray-700'>Size</label>
          <select
            value={filters.size}
            onChange={(e) => handleFilterChange('size', e.target.value)}
            className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value=''>Any</option>
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm text-gray-700'>Discount</label>
          <select
            value={filters.discount}
            onChange={(e) => handleFilterChange('discount', e.target.value)}
            className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            {discountOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={resetFilters}
            className='self-start text-sm text-blue-600 hover:text-blue-700'
          >
            Reset filters
          </button>
        </div>
      </div>

      {loading && (
        <div className='text-center py-20'>
          <p className='text-gray-600'>Loading products...</p>
        </div>
      )}

      {error && (
        <div className='text-center py-20'>
          <p className='text-red-600'>{error}</p>
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className='text-center py-20'>
          <p className='text-gray-600'>No products found.</p>
        </div>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Product
