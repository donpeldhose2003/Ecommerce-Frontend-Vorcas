import React, { useState } from 'react'
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'

const ProductDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const product = location.state?.product
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  if (!product) {
    return (
      <div className='px-5 lg:px-20 py-10 text-center'>
        <p className='text-gray-600 mb-4'>Product details not available.</p>
        <Link to='/products' className='text-blue-600 hover:underline'>Back to products</Link>
      </div>
    )
  }
  
  const handleAddToCart = () => {
    addToCart(product, quantity)
    // Show success feedback and optionally redirect
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
        <div className='w-full h-96 bg-gray-100 overflow-hidden rounded-lg'>
          <img
            className='w-full h-full object-cover'
            src={product.productImage}
            alt={product.productName}
          />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 mb-3'>{product.productName}</h1>
          <div className='flex items-center gap-3 mb-2'>
            {product.discountPrice ? (
              <>
                <span className='text-blue-600 font-bold text-2xl'>${product.discountPrice}</span>
                <span className='text-gray-400 line-through'>${product.productPrice}</span>
              </>
            ) : (
              <span className='text-blue-600 font-bold text-2xl'>${product.productPrice}</span>
            )}
          </div>
          <p className='text-sm text-gray-600 mb-2'>Color: {product.color}</p>
          <p className='text-sm text-gray-600 mb-4'>Size: {product.size}</p>
          <p className='text-sm text-gray-700 mb-4'>{product.fullDescription || product.productDescription}</p>
          <div className='flex items-center gap-4'>
            <div className='flex items-center border border-gray-300 rounded-md overflow-hidden'>
              <button onClick={decrement} className='px-3 py-2 text-gray-700 hover:bg-gray-100'>−</button>
              <span className='px-4 py-2 text-gray-800'>{quantity}</span>
              <button onClick={increment} className='px-3 py-2 text-gray-700 hover:bg-gray-100'>+</button>
            </div>
            <button
              onClick={handleAddToCart}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              Add to Cart
            </button>
            <Link to='/products' className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'>Back to Products</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
