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
      productImage: '/summer.avif',
      productPrice: '19.99',
      category: 'women_tops'
    },
    {
      id: 2,
      productName: 'Blue Casual Blouse',
      productDescription: 'Elegant blue blouse with floral patterns',
      productImage: '/OIP (1).webp',
      productPrice: '29.99',
      category: 'women_tops'
    },
    {
      id: 3,
      productName: 'Pink Summer Top',
      productDescription: 'Light and breathable summer top',
      productImage: '/OIP (2).webp',
      productPrice: '24.99',
      category: 'women_tops'
    },
    {
      id: 4,
      productName: 'Black Formal Shirt',
      productDescription: 'Professional black shirt for office wear',
      productImage: '/OIP (3).webp',
      productPrice: '34.99',
      category: 'women_tops'
    },
    {
      id: 5,
      productName: 'Striped Casual Tee',
      productDescription: 'Comfortable striped t-shirt in navy and white',
      productImage: '/OIP (4).webp',
      productPrice: '22.99',
      category: 'women_tops'
    },
    {
      id: 6,
      productName: 'Floral Print Top',
      productDescription: 'Trendy floral printed top for casual outings',
      productImage: '/633e5c862500003e00566718.webp',
      productPrice: '26.99',
      category: 'women_tops'
    },
  ],
  mens_jeans: [
    {
      id: 7,
      productName: 'Classic Slim Fit Jeans',
      productDescription: 'Slim fit, stretch denim, indigo wash',
      productImage: '/OIP (1).webp',
      productPrice: '39.99',
      category: 'mens_jeans'
    },
    {
      id: 8,
      productName: 'Relaxed Straight Jeans',
      productDescription: 'Relaxed fit, durable fabric, dark wash',
      productImage: '/download.webp',
      productPrice: '34.99',
      category: 'mens_jeans'
    },
    {
      id: 9,
      productName: 'Tapered Fit Jeans',
      productDescription: 'Tapered leg, soft cotton blend, black',
      productImage: '/OIP (2).webp',
      productPrice: '44.99',
      category: 'mens_jeans'
    },
    {
      id: 10,
      productName: 'Light Wash Jeans',
      productDescription: 'Comfort fit, light blue wash',
      productImage: '/OIP (3).webp',
      productPrice: '36.99',
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

  const category = searchParams.get('category') || 'women_tops'

  useEffect(() => {
    fetchProducts(category)
  }, [category])

  const fetchProducts = (categoryFilter) => {
    try {
      setLoading(true)
      setSelectedCategory(categoryFilter)
      
      // In production, replace this with an actual API call:
      // const response = await fetch(`/api/products?category=${categoryFilter}`)
      // const data = await response.json()
      
      const categoryProducts = allProducts[categoryFilter] || []
      setProducts(categoryProducts)
      setFilteredProducts(categoryProducts)
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

  const getCategoryTitle = () => {
    const categoryTitles = {
      women_tops: "Women's Tops",
      mens_jeans: "Men's Jeans",
    }
    return categoryTitles[selectedCategory] || 'Products'
  }

  return (
    <div className='px-5 lg:px-20 py-10'>
      <div className='mb-10 text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-3'>{getCategoryTitle()}</h1>
        <p className='text-gray-600 text-base'>Browse our collection</p>
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
