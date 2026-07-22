import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout/Layout';
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import Categories from './pages/Categories/Categories';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Auth from './pages/Auth/Auth';
import StoreAuth from './pages/StoreAuth/StoreAuth';
import Dashboard from './pages/Dashboard/Dashboard';
import StoreDashboard from './pages/StoreDashboard/StoreDashboard';
import Cart from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import UserPanel from './pages/UserPanel/UserPanel';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Orders from './pages/Orders/Orders';
import StorePage from './pages/StorePage/StorePage';
import SplashScreen from './components/common/SplashScreen/SplashScreen';

// ── Page Transition Variants (Trendyol/Temu style) ──────────────────
const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.99 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0, y: -12, scale: 1.005,
    transition: { duration: 0.22, ease: [0.55, 0, 1, 0.45] }
  }
};

// ── Animated Routes wrapper ──────────────────────────────────────────
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: '100%', minHeight: '100%' }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Auth />} />
          <Route path="/store-login" element={<StoreAuth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/store-dashboard" element={<StoreDashboard />} />
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
                <Route path="/store/:storeId" element={<StorePage />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

// ── App ──────────────────────────────────────────────────────────────
function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <StoreProvider>
            <ProductProvider>
              <CartProvider>
                <WishlistProvider>
                  <OrderProvider>
                    <NotificationProvider>
                      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
                      <Router>
                        <AnimatedRoutes />
                      </Router>
                    </NotificationProvider>
                  </OrderProvider>
                </WishlistProvider>
              </CartProvider>
            </ProductProvider>
          </StoreProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
