import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from './ProductCard'

// Sample product data - in production, this would come from an API
const allProducts = {
  women_tops: [
    {
      id: 1,
      productName: 'Classic White T-Shirt',
      productDescription: 'Comfortable cotton white t-shirt, perfect for everyday wear',
      fullDescription: 'Soft, breathable cotton tee with a tailored fit. Great for layering or wearing solo. Machine washable.',
      productImage: '/summer.avif',
      productPrice: '24.99',
      discountPrice: '19.99',
      color: 'White',
      size: 'M',
      category: 'women_tops'
    },
    {
      id: 2,
      productName: 'Blue Casual Blouse',
      productDescription: 'Elegant blue blouse with floral patterns',
      fullDescription: 'Lightweight chiffon blouse with subtle floral print, relaxed fit, and button cuffs.',
      productImage: '/OIP (1).webp',
      productPrice: '36.99',
      discountPrice: '29.99',
      color: 'Blue',
      size: 'S',
      category: 'women_tops'
    },
    {
      id: 3,
      productName: 'Pink Summer Top',
      productDescription: 'Light and breathable summer top',
      fullDescription: 'Sleeveless top in breathable fabric, ideal for warm days. Relaxed cut with soft touch.',
      productImage: '/OIP (2).webp',
      productPrice: '32.99',
      discountPrice: '24.99',
      color: 'Pink',
      size: 'L',
      category: 'women_tops'
    },
    {
      id: 4,
      productName: 'Black Formal Shirt',
      productDescription: 'Professional black shirt for office wear',
      fullDescription: 'Structured cotton-blend shirt with crisp collar, perfect for office or formal events.',
      productImage: '/OIP (3).webp',
      productPrice: '44.99',
      discountPrice: '34.99',
      color: 'Black',
      size: 'M',
      category: 'women_tops'
    },
    {
      id: 5,
      productName: 'Striped Casual Tee',
      productDescription: 'Comfortable striped t-shirt in navy and white',
      fullDescription: 'Everyday striped tee with crew neck and soft handfeel. Pairs well with denim.',
      productImage: '/OIP (4).webp',
      productPrice: '28.99',
      discountPrice: '22.99',
      color: 'Navy/White',
      size: 'XL',
      category: 'women_tops'
    },
    {
      id: 6,
      productName: 'Floral Print Top',
      productDescription: 'Trendy floral printed top for casual outings',
      fullDescription: 'Flowy silhouette with floral motif, scoop neck, and soft drape for day-long comfort.',
      productImage: '/633e5c862500003e00566718.webp',
      productPrice: '33.99',
      discountPrice: '26.99',
      color: 'Multi',
      size: 'S',
      category: 'women_tops'
    },
  ],
  mens_jeans: [
    {
      id: 7,
      productName: 'Classic Slim Fit Jeans',
      productDescription: 'Slim fit, stretch denim, indigo wash',
      fullDescription: 'Stretch denim with slim silhouette, 5-pocket styling, and durable stitching.',
      productImage: '/OIP (1).webp',
      productPrice: '49.99',
      discountPrice: '39.99',
      color: 'Indigo',
      size: '32',
      category: 'mens_jeans'
    },
    {
      id: 8,
      productName: 'Relaxed Straight Jeans',
      productDescription: 'Relaxed fit, durable fabric, dark wash',
      fullDescription: 'Roomy through thigh with straight leg, rugged fabric built for daily wear.',
      productImage: '/download.webp',
      productPrice: '44.99',
      discountPrice: '34.99',
      color: 'Dark Wash',
      size: '34',
      category: 'mens_jeans'
    },
    {
      id: 9,
      productName: 'Tapered Fit Jeans',
      productDescription: 'Tapered leg, soft cotton blend, black',
      fullDescription: 'Modern tapered cut with soft cotton blend, minimal stretch for clean lines.',
      productImage: '/OIP (2).webp',
      productPrice: '54.99',
      discountPrice: '44.99',
      color: 'Black',
      size: '32',
      category: 'mens_jeans'
    },
    {
      id: 10,
      productName: 'Light Wash Jeans',
      productDescription: 'Comfort fit, light blue wash',
      fullDescription: 'Casual light-wash denim with comfort fit and subtle fading.',
      productImage: '/OIP (3).webp',
      productPrice: '46.99',
      discountPrice: '36.99',
      color: 'Light Blue',
      size: '36',
      category: 'mens_jeans'
    },
  ],
}

const Product = () => {
  const [searchParams] = useSearchParams()
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

  const category = searchParams.get('category') || 'women_tops'

  useEffect(() => {
    fetchProducts(category)
  }, [category])

  useEffect(() => {
    setFilteredProducts(applyFilters(products, filters))
  }, [products, filters])

  const fetchProducts = (categoryFilter) => {
    try {
      setLoading(true)
      setSelectedCategory(categoryFilter)
      
      // In production, replace this with an actual API call:
      // const response = await fetch(`/api/products?category=${categoryFilter}`)
      // const data = await response.json()
      
      const categoryProducts = allProducts[categoryFilter] || []
      setProducts(categoryProducts)
      setFilteredProducts(applyFilters(categoryProducts, filters))
      setError(null)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products')
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
      women_tops: "Women's Tops",
      mens_jeans: "Men's Jeans",
    }
    return categoryTitles[selectedCategory] || 'Products'
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
          <label className='text-sm text-gray-700'>Price range ($)</label>
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
          <p className='text-gray-600'>No products found in this category.</p>
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
