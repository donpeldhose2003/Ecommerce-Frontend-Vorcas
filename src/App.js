import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './customer/components/navigation/Navigation';
import Footer from './customer/components/Footer/Footer';
import { HomePage } from './customer/pages/HomePage/HomePage';
import Product from './customer/components/Product/Product';
import ProductDetails from './customer/components/ProductDetails/ProductDetails';
import Cart from './customer/components/Cart/Cart';
import Checkout from './customer/components/Checkout/Checkout';
import Login from './customer/components/registration/login';
import Register from './customer/components/registration/register';
import AdminPage from './customer/components/admin/AdminPage';
import ProductsPage from './customer/components/admin/ProductsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="">
      {!isAdminRoute && <Navigation />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<Product />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminPage />} requiredRole="admin" />}
        />
        <Route
          path="/admin/products"
          element={<ProtectedRoute element={<ProductsPage />} requiredRole="admin" />}
        />
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppRoutes />
      </Router>
    </CartProvider>
  );
}

export default App;
