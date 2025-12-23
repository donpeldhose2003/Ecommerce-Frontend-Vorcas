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
      <div className='w-full h-64 bg-gray-200 overflow-hidden'>
        <img
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
          src={product.productImage}
          alt={product.productName}
        />
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
                <span className='text-blue-600 font-bold text-lg'>${product.discountPrice}</span>
                <span className='text-sm line-through text-gray-400'>${product.productPrice}</span>
              </div>
            ) : (
              <span className='text-blue-600 font-bold text-lg'>${product.productPrice}</span>
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
