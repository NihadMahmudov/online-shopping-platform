import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Sun, Moon, Home, Package, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import styles from './Navbar.module.css';

const AZFlag = () => (
  <svg width="18" height="12" viewBox="0 0 1200 600" style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="1200" height="200" fill="#3f9fc6"/>
    <rect y="200" width="1200" height="200" fill="#ed2939"/>
    <rect y="400" width="1200" height="200" fill="#3f9c35"/>
    <circle cx="600" cy="300" r="60" fill="#fff"/>
    <circle cx="618" cy="300" r="60" fill="#ed2939"/>
    <polygon points="638,300 648,303 646,293 654,286 644,286 638,278 632,286 622,286 630,293 628,303" fill="#fff"/>
  </svg>
);

const GBFlag = () => (
  <svg width="18" height="12" viewBox="0 0 60 30" style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}>
    <clipPath id="s">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#s)"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="4" clipPath="url(#s)"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6"/>
  </svg>
);

const RUFlag = () => (
  <svg width="18" height="12" viewBox="0 0 9 6" style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="9" height="2" fill="#fff"/>
    <rect y="2" width="9" height="2" fill="#0039a6"/>
    <rect y="4" width="9" height="2" fill="#d52b1e"/>
  </svg>
);

const languagesList = [
  { code: 'az', label: 'AZ', fullName: 'Azərbaycan', flag: <AZFlag /> },
  { code: 'en', label: 'EN', fullName: 'English', flag: <GBFlag /> },
  { code: 'ru', label: 'RU', fullName: 'Русский', flag: <RUFlag /> },
];

const Navbar = () => {
  const { user, logout, isSuperAdmin, isVendor } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

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
            <Link to="/">Atlas<span>Mall</span></Link>
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
              <button 
                className={styles.langDropdownTrigger}
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Dil seçimi"
              >
                {languagesList.find(l => l.code === language)?.flag}
                <span>{languagesList.find(l => l.code === language)?.label}</span>
                <ChevronDown size={12} className={isLangOpen ? styles.rotated : ''} />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <>
                    <div className={styles.langDropdownOverlay} onClick={() => setIsLangOpen(false)} />
                    <motion.div 
                      className={styles.langDropdownMenu}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      {languagesList.map((lang) => (
                        <button
                          key={lang.code}
                          className={`${styles.langDropdownItem} ${language === lang.code ? styles.langActive : ''}`}
                          onClick={() => {
                            changeLanguage(lang.code);
                            setIsLangOpen(false);
                          }}
                        >
                          <span className={styles.flagIcon}>{lang.flag}</span>
                          <span className={styles.langName}>{lang.fullName}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button className={styles.iconBtn} onClick={toggleTheme} title={isDarkMode ? t('navbar.lightMode') : t('navbar.darkMode')}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User */}
            {user ? (
              <div className={styles.userMenu}>
                <span className={styles.userName}>{user.name}</span>
                {isSuperAdmin && (
                  <Link to="/dashboard" className={styles.adminBtn} title={t('navbar.adminPanel')}>
                    <Settings size={20} />
                  </Link>
                )}
                {isVendor && (
                  <Link to="/store-dashboard" className={styles.adminBtn} title="Mağaza Paneli">
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
          <div className={styles.drawerLogo}>Atlas<span>Mall</span></div>
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

          <div className={styles.drawerLangSection}>
            <div className={styles.drawerLangHeader}>
              <Globe size={20} />
              <span>Dil Seçimi</span>
            </div>
            <div className={styles.drawerLangList}>
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  className={`${styles.drawerLangBtn} ${language === lang.code ? styles.drawerLangActive : ''}`}
                  onClick={() => {
                    changeLanguage(lang.code);
                    closeDrawer();
                  }}
                >
                  <span className={styles.drawerFlagIcon}>{lang.flag}</span>
                  <span className={styles.drawerLangName}>{lang.fullName}</span>
                </button>
              ))}
            </div>
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
              {isSuperAdmin && (
                <Link to="/dashboard" onClick={closeDrawer} className={styles.drawerLoginBtn}>
                  <Settings size={18} /> {t('navbar.adminPanel')}
                </Link>
              )}
              {isVendor && (
                <Link to="/store-dashboard" onClick={closeDrawer} className={styles.drawerLoginBtn}>
                  <Settings size={18} /> Mağaza Paneli
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
