import React from 'react'
import { useCart } from '../../../context/CartContext'

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart()

  const handleIncrease = () => {
    updateQuantity(item.id, item.size, item.color, item.quantity + 1)
  }

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.size, item.color, item.quantity - 1)
    }
  }

  const handleRemove = () => {
    removeFromCart(item.id, item.size, item.color)
  }

  const itemPrice = parseFloat(item.discountPrice || item.productPrice)
  const itemTotal = itemPrice * item.quantity

  return (
    <div className='bg-white rounded-lg shadow-md p-4 flex gap-4'>
      <div className='w-32 h-32 bg-gray-100 rounded-md overflow-hidden flex-shrink-0'>
        <img
          src={item.productImage}
          alt={item.productName}
          className='w-full h-full object-cover'
        />
      </div>

      <div className='flex-1 flex flex-col justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-1'>{item.productName}</h3>
          <p className='text-sm text-gray-600 mb-2'>{item.productDescription}</p>
          <div className='flex gap-4 text-sm text-gray-600'>
            <span>Color: {item.color}</span>
            <span>Size: {item.size}</span>
          </div>
        </div>

        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleDecrease}
              className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100'
            >
              −
            </button>
            <span className='text-gray-800 font-medium w-8 text-center'>{item.quantity}</span>
            <button
              onClick={handleIncrease}
              className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100'
            >
              +
            </button>
          </div>

          <div className='flex items-center gap-4'>
            <div className='text-right'>
              {item.discountPrice && (
                <div className='text-sm text-gray-400 line-through'>${parseFloat(item.productPrice).toFixed(2)}</div>
              )}
              <div className='text-lg font-bold text-blue-600'>${itemTotal.toFixed(2)}</div>
            </div>
            <button
              onClick={handleRemove}
              className='text-red-500 hover:text-red-700 text-sm font-medium'
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItem
