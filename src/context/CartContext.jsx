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
  // Get current user to make cart user-specific
  const getCurrentUser = () => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        return user.email || user.id || null
      } catch {
        return null
      }
    }
    return null
  }

  const [currentUser, setCurrentUser] = useState(getCurrentUser())

  const [cartItems, setCartItems] = useState(() => {
    const user = getCurrentUser()
    if (!user) return []
    
    const cartKey = `cart_${user}`
    const savedCart = localStorage.getItem(cartKey)
    return savedCart ? JSON.parse(savedCart) : []
  })

  // Update cart in localStorage whenever it changes
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      const cartKey = `cart_${user}`
      localStorage.setItem(cartKey, JSON.stringify(cartItems))
    }
  }, [cartItems])

  // Listen for user changes (login/logout/switch user)
  useEffect(() => {
    const handleUserChange = () => {
      const newUser = getCurrentUser()
      
      // If user changed, load their cart
      if (newUser !== currentUser) {
        setCurrentUser(newUser)
        
        if (newUser) {
          const cartKey = `cart_${newUser}`
          const savedCart = localStorage.getItem(cartKey)
          setCartItems(savedCart ? JSON.parse(savedCart) : [])
        } else {
          // No user logged in, clear cart
          setCartItems([])
        }
      }
    }

    // Listen for storage changes and custom events
    window.addEventListener('storage', handleUserChange)
    window.addEventListener('userLogin', handleUserChange)
    window.addEventListener('userLogout', handleUserChange)

    return () => {
      window.removeEventListener('storage', handleUserChange)
      window.removeEventListener('userLogin', handleUserChange)
      window.removeEventListener('userLogout', handleUserChange)
    }
  }, [currentUser])

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === product.id && item.size === product.size && item.color === product.color
      )

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && item.size === product.size && item.color === product.color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [...prevItems, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId, size, color) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === productId && item.size === size && item.color === color)
      )
    )
  }

  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.discountPrice || item.productPrice)
      return total + price * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
