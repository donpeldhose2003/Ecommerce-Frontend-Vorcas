import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get authorization token
  const getToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  }

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      setLoading(true)
      const token = getToken()
      
      if (!token) {
        setCartItems([])
        return
      }

      const response = await fetch('http://localhost:8080/api/cart/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('fetchCart response:', data)
        
        // Handle different response formats
        let cartData = []
        if (Array.isArray(data)) {
          cartData = data
        } else if (data && data.cartItems) {
          cartData = data.cartItems
        } else if (data && data.items) {
          cartData = data.items
        } else if (data && data.data) {
          cartData = data.data
        }
        
        // Transform backend response to match frontend expectations
        const transformedCart = cartData.map((item) => ({
          id: item._id || item.id || item.productId,
          productId: item.productId,
          productName: item.name || item.productName,
          productImage: item.imagePath || item.productImage,
          productDescription: item.description || item.productDescription || '',
          price: item.price,
          discountPrice: item.price,
          quantity: item.quantity,
          size: item.size,  // Can be null
          color: item.color,  // Can be null
        }))
        
        console.log('Transformed fetchCart:', transformedCart)
        setCartItems(transformedCart)
        setError(null)
      } else if (response.status === 401) {
        // Token expired or invalid
        setCartItems([])
      } else {
        console.error('Failed to fetch cart:', response.status)
        setCartItems([])
      }
    } catch (err) {
      console.error('Error fetching cart:', err)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  // Load cart on mount and when user changes
  useEffect(() => {
    fetchCart()

    // Listen for login/logout events
    const handleUserChange = () => {
      fetchCart()
    }

    window.addEventListener('userLogin', handleUserChange)
    window.addEventListener('userLogout', handleUserChange)

    return () => {
      window.removeEventListener('userLogin', handleUserChange)
      window.removeEventListener('userLogout', handleUserChange)
    }
  }, [])

  const addToCart = async (product, quantity = 1) => {
    try {
      const token = getToken()
      console.log('addToCart called with:', { product, quantity })
      console.log('Token available:', !!token)
      
      if (!token) {
        setError('Please login to add items to cart')
        console.warn('No token available for adding to cart')
        return
      }

      // Backend API accepts productId, quantity, size, and color
      const payload = {
        productId: product.id,
        quantity: quantity,
        size: product.selectedSize || product.size || null,
        color: product.color || null,
      }

      console.log('Sending to backend:', JSON.stringify(payload))
      console.log('Product details - id:', product.id, 'selectedSize:', product.selectedSize, 'size:', product.size, 'color:', product.color)

      const response = await fetch('http://localhost:8080/api/cart/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('Add to cart response status:', response.status)

      if (response.ok) {
        const updatedCart = await response.json()
        console.log('Raw response from backend:', updatedCart)
        console.log('Response type:', typeof updatedCart)
        console.log('Is array:', Array.isArray(updatedCart))
        
        // Handle different response formats
        let cartData = []
        if (Array.isArray(updatedCart)) {
          cartData = updatedCart
        } else if (updatedCart && updatedCart.cartItems) {
          cartData = updatedCart.cartItems
        } else if (updatedCart && updatedCart.items) {
          cartData = updatedCart.items
        } else if (updatedCart && updatedCart.data) {
          cartData = updatedCart.data
        }
        
        console.log('Processed cart data:', cartData)
        console.log('First cart item structure:', cartData[0])
        if (cartData.length > 0) {
          console.log('Item properties:', Object.keys(cartData[0]))
        }
        
        // Transform backend response to match frontend expectations
        const transformedCart = cartData.map((item) => ({
          id: item._id || item.id || item.productId,
          productId: item.productId,
          productName: item.name || item.productName,
          productImage: item.imagePath || item.productImage,
          productDescription: item.description || item.productDescription || '',
          price: item.price,
          discountPrice: item.price,
          quantity: item.quantity,
          size: item.size,  // Can be null
          color: item.color,  // Can be null
        }))
        
        console.log('Transformed cart:', transformedCart)
        console.log('Setting cartItems to:', transformedCart)
        setCartItems(transformedCart)
        setError(null)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Add to cart error:', errorData)
        setError(errorData.message || 'Failed to add item to cart')
      }
    } catch (err) {
      console.error('Error adding to cart:', err)
      setError('Error adding item to cart: ' + err.message)
    }
  }

  const removeFromCart = async (productId, size, color) => {
    try {
      const token = getToken()
      if (!token) return

      // Build query params for size and color
      let url = `http://localhost:8080/api/cart/items/${productId}`
      const params = new URLSearchParams()
      if (size !== null && size !== undefined) params.append('size', size)
      if (color !== null && color !== undefined) params.append('color', color)
      if (params.toString()) {
        url += '?' + params.toString()
      }

      console.log('Removing from cart:', { productId, size, color, url })

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Remove response:', data)
        
        // Handle different response formats
        let cartData = []
        if (Array.isArray(data)) {
          cartData = data
        } else if (data && data.items) {
          cartData = data.items
        }
        
        // Transform response
        const transformedCart = cartData.map((item) => ({
          id: item._id || item.id || item.productId,
          productId: item.productId,
          productName: item.name || item.productName,
          productImage: item.imagePath || item.productImage,
          productDescription: item.description || item.productDescription || '',
          price: item.price,
          discountPrice: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }))
        
        setCartItems(transformedCart)
        setError(null)
      } else {
        setError('Failed to remove item from cart')
      }
    } catch (err) {
      console.error('Error removing from cart:', err)
      setError('Error removing item from cart')
    }
  }

  const updateQuantity = async (productId, size, color, quantity) => {
    try {
      const token = getToken()
      if (!token) return

      if (quantity <= 0) {
        removeFromCart(productId, size, color)
        return
      }

      // Build query params for size and color
      let url = `http://localhost:8080/api/cart/items/${productId}`
      const params = new URLSearchParams()
      if (size !== null && size !== undefined) params.append('size', size)
      if (color !== null && color !== undefined) params.append('color', color)
      if (params.toString()) {
        url += '?' + params.toString()
      }

      console.log('Updating quantity:', { productId, size, color, quantity, url })

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, size, color }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Update response:', data)
        
        // Handle different response formats
        let cartData = []
        if (Array.isArray(data)) {
          cartData = data
        } else if (data && data.items) {
          cartData = data.items
        }
        
        // Transform response
        const transformedCart = cartData.map((item) => ({
          id: item._id || item.id || item.productId,
          productId: item.productId,
          productName: item.name || item.productName,
          productImage: item.imagePath || item.productImage,
          productDescription: item.description || item.productDescription || '',
          price: item.price,
          discountPrice: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }))
        
        setCartItems(transformedCart)
        setError(null)
      } else {
        setError('Failed to update item quantity')
      }
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError('Error updating item quantity')
    }
  }

  const clearCart = async () => {
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch('http://localhost:8080/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok || response.status === 204) {
        setCartItems([])
        setError(null)
      } else {
        setError('Failed to clear cart')
      }
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError('Error clearing cart')
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price || item.discountPrice || 0)
      return total + price * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    loading,
    error,
    refreshCart: fetchCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
