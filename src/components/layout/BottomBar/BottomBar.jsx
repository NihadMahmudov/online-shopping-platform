import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, ShoppingBag, User, Heart } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './BottomBar.module.css';

const BottomBar = () => {
  const { cartItemCount } = useCart();
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || user.role === 'admin' || location.pathname === '/') {
    return null;
  }

  const navItems = [
    { 
      onClick: () => navigate('/panel', { state: { activeTab: 'kataloq' } }), 
      icon: <Home size={22} />, 
      label: 'Kataloq',
      active: location.pathname === '/panel' && location.state?.activeTab === 'kataloq'
    },
    { 
      onClick: () => navigate('/panel', { state: { activeTab: 'stores' } }), 
      icon: <Compass size={22} />, 
      label: 'Mağazalar',
      active: location.pathname === '/panel' && location.state?.activeTab === 'stores'
    },
    { 
      onClick: () => navigate('/panel', { state: { activeTab: 'wishlist' } }), 
      icon: <Heart size={22} />, 
      label: t('bottomBar.wishlist'), 
      count: wishlist.length,
      active: location.pathname === '/panel' && location.state?.activeTab === 'wishlist'
    },
    { 
      onClick: () => navigate('/panel', { state: { activeTab: 'cart' } }), 
      icon: <ShoppingBag size={22} />, 
      label: t('bottomBar.cart'), 
      count: cartItemCount,
      active: location.pathname === '/panel' && location.state?.activeTab === 'cart'
    },
    { 
      onClick: () => navigate('/panel'), 
      icon: <User size={22} />, 
      label: t('bottomBar.profile'),
      active: location.pathname === '/panel' && !location.state?.activeTab
    },
  ];

  return (
    <nav className={styles.bottomBar}>
      {navItems.map((item, idx) => (
        <button
          key={idx}
          onClick={item.onClick}
          className={`${styles.navItem} ${item.active ? styles.active : ''}`}
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
        >
          <div className={styles.iconWrap}>
            {item.icon}
            {item.count > 0 && (
              <span className={styles.badge}>{item.count > 9 ? '9+' : item.count}</span>
            )}
          </div>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomBar;
