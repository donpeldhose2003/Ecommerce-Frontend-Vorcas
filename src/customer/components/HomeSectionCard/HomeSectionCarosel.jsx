import React from 'react'
import { useNavigate } from 'react-router-dom'
import HomeSectionCard from './HomeSectionCard'

const HomeSectionCarosel = ({ products = [], loading = false, title = 'Featured Products' }) => {
  const navigate = useNavigate()

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } })
  }

  return (
    <div className='px-5 lg:px-20 py-10'>
      <h2 className='text-2xl font-bold text-gray-800 mb-8'>{title}</h2>
      
      {loading ? (
        <div className='text-center py-10'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          <p className='text-gray-600 mt-4'>Loading products...</p>
        </div>
      ) : products && products.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {products.map((product) => (
            <div key={product.id} onClick={() => handleProductClick(product)} className='cursor-pointer'>
              <HomeSectionCard
                productName={product.productName}
                productDescription={product.productDescription}
                productImage={product.productImage}
                productPrice={product.discountPrice || product.productPrice}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className='text-gray-600'>No products available</p>
      )}
    </div>
  )
}

export default HomeSectionCarosel