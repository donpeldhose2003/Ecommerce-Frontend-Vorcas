import React from 'react'
import { useNavigate } from 'react-router-dom'

const ProductCard = ({ product }) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/product/${product.id}`, { state: { product } })
  }

  return (
    <div
      onClick={handleCardClick}
      className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer group'
    >
      <div className='w-full h-64 bg-gray-100 overflow-hidden flex items-center justify-center'>
        {product.productImage ? (
          <img
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            src={product.productImage}
            alt={product.productName}
          />
        ) : (
          <div className='text-center text-gray-400'>
            <svg className='w-20 h-20 mx-auto mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
            </svg>
            <p className='text-sm'>No Image</p>
          </div>
        )}
      </div>
      <div className='p-4'>
        <h3 className='text-lg font-semibold text-gray-800 mb-2 truncate'>
          {product.productName}
        </h3>
        <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
          {product.productDescription}
        </p>
        <div className='flex justify-between items-center mb-2'>
          <div>
            {product.discountPrice ? (
              <div className='flex items-center gap-2'>
                <span className='text-blue-600 font-bold text-lg'>Rs. {product.discountPrice}</span>
                <span className='text-sm line-through text-gray-400'>Rs. {product.productPrice}</span>
              </div>
            ) : (
              <span className='text-blue-600 font-bold text-lg'>Rs. {product.productPrice}</span>
            )}
            <p className='text-xs text-gray-500'>Color: {product.color} · Size: {product.size}</p>
          </div>
          <span className='text-sm text-gray-500 group-hover:text-blue-600 transition-colors'>View details →</span>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
