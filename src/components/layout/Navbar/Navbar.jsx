import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Heart, LogOut, Settings, Sun, Moon, Home, Compass, Package, Globe } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { cartItemCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  const handleLogout = () => {
    logout();
    setIsDrawerOpen(false);
    navigate('/');
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const navLinks = [
    { to: '/', label: t('navbar.home'), icon: <Home size={20} /> },
    { to: '/about', label: t('navbar.about'), icon: <User size={20} /> },
    { to: '/contact', label: t('navbar.contact'), icon: <Package size={20} /> },
  ];

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.navContainer}`}>
          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Menyunu aç"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <div className={styles.logo}>
            <Link to="/">BAME<span>.</span></Link>
          </div>

          {/* Desktop Nav Links */}
          <div className={styles.navLinks}>
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => isActive ? styles.activeLink : ''}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className={styles.navActions}>
            {/* Language Toggle */}
            <div className={styles.langSwitcher}>
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className={styles.langSelect}
              >
                <option value="az">AZ</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button className={styles.iconBtn} onClick={toggleTheme} title={isDarkMode ? t('navbar.lightMode') : t('navbar.darkMode')}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User */}
            {user ? (
              <div className={styles.userMenu}>
                <span className={styles.userName}>{user.name}</span>
                {isAdmin && (
                  <Link to="/dashboard" className={styles.adminBtn} title={t('navbar.adminPanel')}>
                    <Settings size={20} />
                  </Link>
                )}
                <button onClick={handleLogout} className={styles.logoutBtn} title={t('navbar.logout')}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className={styles.loginBtn}>
                <User size={16} /> {t('navbar.login')}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`${styles.drawerOverlay} ${isDrawerOpen ? styles.overlayVisible : ''}`}
        onClick={closeDrawer}
      />

      {/* Mobile Side Drawer */}
      <aside className={`${styles.mobileDrawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerLogo}>BAME<span>.</span></div>
          <button className={styles.drawerClose} onClick={closeDrawer}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.drawerNav}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `${styles.drawerLink} ${isActive ? styles.drawerActive : ''}`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}

          <div className={styles.drawerLink} style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Globe size={20} />
              Dil Seçimi
            </div>
            <select 
              value={language} 
              onChange={(e) => { changeLanguage(e.target.value); closeDrawer(); }}
              style={{ padding: '5px', borderRadius: '5px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="az">AZ</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select>
          </div>

          <button
            className={styles.drawerLink}
            onClick={() => { toggleTheme(); closeDrawer(); }}
            style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isDarkMode ? t('navbar.lightMode') : t('navbar.darkMode')}
          </button>
        </nav>

        <div className={styles.drawerFooter}>
          {user ? (
            <>
              <div className={styles.drawerUser}>
                <div className={styles.drawerAvatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.drawerUserInfo}>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
              {isAdmin && (
                <Link to="/dashboard" onClick={closeDrawer} className={styles.drawerLoginBtn}>
                  <Settings size={18} /> {t('navbar.adminPanel')}
                </Link>
              )}
              <button className={styles.drawerLogout} onClick={handleLogout}>
                <LogOut size={18} /> {t('navbar.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeDrawer} className={styles.drawerLoginBtn}>
              <User size={18} /> {t('navbar.loginRegister')}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
