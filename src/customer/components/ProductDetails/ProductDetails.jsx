import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'

const ProductDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const product = location.state?.product

  if (!product) {
    return (
      <div className='px-5 lg:px-20 py-10 text-center'>
        <p className='text-gray-600 mb-4'>Product details not available.</p>
        <Link to='/products' className='text-blue-600 hover:underline'>Back to products</Link>
      </div>
    )
  }

  return (
    <div className='px-5 lg:px-20 py-10'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='w-full h-96 bg-gray-100 overflow-hidden rounded-lg'>
          <img
            className='w-full h-full object-cover'
            src={product.productImage}
            alt={product.productName}
          />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 mb-3'>{product.productName}</h1>
          <p className='text-xl text-blue-600 font-semibold mb-4'>${product.productPrice}</p>
          <p className='text-gray-700 mb-6'>{product.productDescription}</p>
          <div className='flex gap-3'>
            <button className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>Add to Cart</button>
            <Link to='/products' className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'>Back to Products</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
