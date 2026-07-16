import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Store, Heart, ShoppingCart, User as UserIcon, LogOut, Package, LayoutGrid, Menu, X, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import Shop from '../Shop/Shop';
import Cart from '../Cart/Cart';
import Wishlist from '../Wishlist/Wishlist';
import Orders from '../Orders/Orders';
import Categories from '../Categories/Categories';
import styles from './UserPanel.module.css';

const UserPanel = () => {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || 'kataloq';
  });

  const [prevActiveTab, setPrevActiveTab] = useState(location.state?.activeTab);

  if (location.state?.activeTab !== prevActiveTab) {
    setPrevActiveTab(location.state?.activeTab);
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const TABS = [
    { id: 'kataloq', label: 'Kataloq', icon: <Store size={20} />, count: null },
    { id: 'categories', label: 'Kateqoriyalar', icon: <LayoutGrid size={20} />, count: null },
    { id: 'wishlist', label: 'Sevimlilər', icon: <Heart size={20} />, count: wishlist.length },
    { id: 'cart', label: 'Səbət', icon: <ShoppingCart size={20} />, count: cartItemCount },
    { id: 'orders', label: 'Sifarişlər', icon: <Package size={20} />, count: null }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.panelContainer}>
      {/* Mobile Top Bar */}
      <header className={styles.mobileHeader}>
        <Link to="/" className={styles.mobileHomeBtn}>
          <Home size={20} />
        </Link>
        <div className={styles.logo}>
          <span>Atlas</span><span className={styles.logoDot}>Mall</span>
        </div>
        <div className={styles.mobileAvatar} onClick={() => setIsMobileMenuOpen(true)}>
          {user.name.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* Slide Drawer for Mobile (user info + logout) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.drawerOverlay} 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={styles.sidebarDrawer}
            >
              <div className={styles.drawerHeader}>
                <div className={styles.logo}>
                  <span>Atlas</span><span className={styles.logoDot}>Mall</span>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userDetails}>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
              </div>

              <nav className={styles.drawerNav}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ''}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className={styles.itemMain}>
                      {tab.icon}
                      {tab.label}
                    </div>
                    {tab.count > 0 && <span className={styles.badge}>{tab.count}</span>}
                  </button>
                ))}
              </nav>

              <div className={styles.drawerFooterActions}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  <LogOut size={18} /> Çıxış
                </button>
                <Link to="/" className={styles.backToSiteBtn} onClick={() => setIsMobileMenuOpen(false)}>
                  <Home size={18} /> Ana Səhifə
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Left Sidebar (hidden on mobile via CSS) */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Link to="/"><span>Atlas</span><span className={styles.logoDot}>Mall</span></Link>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userDetails}>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <nav className={styles.navMenu}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className={styles.itemMain}>
                {tab.icon}
                {tab.label}
              </div>
              {tab.count > 0 && <span className={styles.badge}>{tab.count}</span>}
            </button>
          ))}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} /> Çıxış
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={styles.tabWrapper}
          >
            {activeTab === 'kataloq' && <Shop inPanel={true} />}
            {activeTab === 'categories' && <Categories inPanel={true} />}
            {activeTab === 'wishlist' && <Wishlist inPanel={true} />}
            {activeTab === 'cart' && <Cart inPanel={true} />}
            {activeTab === 'orders' && <Orders inPanel={true} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className={styles.mobileBottomBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.bottomTabItem} ${activeTab === tab.id ? styles.bottomTabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className={styles.bottomTabIcon}>
              {tab.icon}
              {tab.count > 0 && <span className={styles.bottomBadge}>{tab.count > 9 ? '9+' : tab.count}</span>}
            </div>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default UserPanel;
