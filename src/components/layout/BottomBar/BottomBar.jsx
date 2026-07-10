import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

  if (!user || user.role === 'admin') {
    return null;
  }

  const navItems = [
    { to: '/', icon: <Home size={22} />, label: t('bottomBar.home') },
    { to: '/categories', icon: <Compass size={22} />, label: t('bottomBar.categories') },
    { to: '/wishlist', icon: <Heart size={22} />, label: t('bottomBar.wishlist'), count: wishlist.length },
    { to: '/cart', icon: <ShoppingBag size={22} />, label: t('bottomBar.cart'), count: cartItemCount },
    { to: user ? '/panel' : '/login', icon: <User size={22} />, label: user ? t('bottomBar.profile') : t('bottomBar.login') },
  ];

  return (
    <nav className={styles.bottomBar}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
          end={item.to === '/'}
        >
          <div className={styles.iconWrap}>
            {item.icon}
            {item.count > 0 && (
              <span className={styles.badge}>{item.count > 9 ? '9+' : item.count}</span>
            )}
          </div>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomBar;
