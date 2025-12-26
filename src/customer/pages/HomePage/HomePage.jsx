import React, { useState, useEffect } from 'react'
import MainCarosel from '../../components/HomeCarosel/MainCarosel'
import HomeSectionCarosel from '../../components/HomeSectionCard/HomeSectionCarosel'
import { API_ENDPOINTS } from '../../../utils/api'

// Map API response to frontend format
const mapApiProductToFrontend = (apiProduct) => {
  console.log('Mapping product:', apiProduct.name)
  console.log('  - Image path from API:', apiProduct.imagePath)
  console.log('  - Full product data:', apiProduct)
  
  return {
    id: apiProduct.id,
    productName: apiProduct.name,
    productPrice: apiProduct.originalPrice,
    discountPrice: apiProduct.finalPrice,
    productImage: apiProduct.imagePath || null,
    productDescription: apiProduct.description || '',
    color: apiProduct.colors?.[0] || 'N/A',
    size: apiProduct.sizes?.[0] || 'N/A',
    sizes: apiProduct.sizes || [],
    category: apiProduct.category || '',
  }
}

export const HomePage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // Get token from localStorage or sessionStorage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token')
        console.log('Token available:', !!token)
        console.log('API URL:', API_ENDPOINTS.GET_PRODUCTS)
        
        const headers = {
          'Content-Type': 'application/json',
        }
        
        if (token) {
          // Ensure token has Bearer prefix
          const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`
          headers['Authorization'] = authToken
          console.log('Auth header set:', authToken.substring(0, 50) + '...')
        }
        
        const response = await fetch(API_ENDPOINTS.GET_PRODUCTS, {
          headers,
        })
        
        console.log('Response status:', response.status, response.statusText)
        
        const data = await response.json()
        console.log('Response data:', data)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${data?.message || response.statusText}`)
        }
        
        if (Array.isArray(data)) {
          const mappedProducts = data.map(mapApiProductToFrontend)
          console.log('Mapped products:', mappedProducts.length)
          setProducts(mappedProducts)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (error) {
        console.error('Error fetching products:', error.message, error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div>
      <MainCarosel />
      <HomeSectionCarosel products={products} loading={loading} />
    </div>
  )
}
