import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/layout/Layout/Layout';
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import Categories from './pages/Categories/Categories';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Auth from './pages/Auth/Auth';
import Dashboard from './pages/Dashboard/Dashboard';
import Cart from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import UserPanel from './pages/UserPanel/UserPanel';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Orders from './pages/Orders/Orders';
import SplashScreen from './components/common/SplashScreen/SplashScreen';

function App() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashFinish = () => {
    setSplashDone(true);
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <WishlistProvider>
                <OrderProvider>
                  {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
                  <Router>
                    <Routes>
                      <Route path="/login" element={<Auth />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/panel" element={<UserPanel />} />
                      <Route path="/*" element={
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/orders" element={<Orders />} />
                          </Routes>
                        </Layout>
                      } />
                    </Routes>
                  </Router>
                </OrderProvider>
              </WishlistProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
