import React from 'react'
import { useCart } from '../../../context/CartContext'
import CartItem from './CartItem'
import { Link } from 'react-router-dom'

const Cart = () => {
  const { cartItems, getCartTotal, clearCart } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className='px-5 lg:px-20 py-10'>
        <div className='text-center py-20'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>Your cart is empty</h2>
          <p className='text-gray-600 mb-6'>Add some products to get started!</p>
          <Link
            to='/products'
            className='inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='px-5 lg:px-20 py-10'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Shopping Cart</h1>
        <p className='text-gray-600'>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2'>
          <div className='space-y-4'>
            {cartItems.map((item) => (
              <CartItem key={`${item.id}-${item.size}-${item.color}`} item={item} />
            ))}
          </div>
        </div>

        <div className='lg:col-span-1'>
          <div className='bg-gray-50 rounded-lg p-6 sticky top-4'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>Order Summary</h2>
            
            <div className='space-y-3 mb-4'>
              {cartItems.map((item) => {
                const itemPrice = parseFloat(item.discountPrice || item.productPrice)
                const itemTotal = itemPrice * item.quantity
                return (
                  <div key={`${item.id}-${item.size}-${item.color}`} className='flex justify-between text-sm text-gray-700'>
                    <span className='flex-1 truncate pr-2'>
                      {item.productName} ({item.size})
                    </span>
                    <span className='whitespace-nowrap'>
                      {item.quantity} x Rs. {itemPrice.toFixed(2)} = Rs. {itemTotal.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className='space-y-3 mb-6 pt-3 border-t border-gray-300'>
              <div className='flex justify-between text-gray-600'>
                <span>Subtotal</span>
                <span>Rs. {getCartTotal().toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-gray-600'>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className='border-t border-gray-300 pt-3 flex justify-between text-lg font-bold text-gray-900'>
                <span>Total</span>
                <span>Rs. {getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <Link
              to='/checkout'
              className='block w-full mb-3 px-6 py-3 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors font-semibold'
            >
              Proceed to Checkout
            </Link>

            <Link
              to='/products'
              className='block text-center text-blue-600 hover:text-blue-700 mb-3'
            >
              Continue Shopping
            </Link>

            <button
              onClick={clearCart}
              className='w-full px-6 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors'
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
