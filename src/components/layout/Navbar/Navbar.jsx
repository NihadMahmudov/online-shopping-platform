import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Home, Package, Bell, CheckCheck, Trash2, ShoppingBag, Store, Heart, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useNotifications } from '../../../context/NotificationContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout, isSuperAdmin, isVendor } = useAuth();
  const { t } = useLanguage();
  const { getFilteredNotifications, getUnreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const userEmail = user?.email;
  const storeId = user?.storeId;

  const filteredNotifs = getFilteredNotifications(userEmail, storeId, isSuperAdmin);
  const unreadCount = getUnreadCount(userEmail, storeId, isSuperAdmin);

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

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    setIsNotifOpen(false);

    if (isVendor) {
      navigate('/store-dashboard');
    } else if (isSuperAdmin) {
      navigate('/dashboard');
    } else {
      navigate('/panel', { state: { activeTab: 'orders' } });
    }
  };

  const navLinks = user
    ? []
    : [
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
            <Link to={user ? (isVendor ? '/store-dashboard' : isSuperAdmin ? '/dashboard' : '/panel') : '/'}>Atlas<span>Mall</span></Link>
            {user && (
              <button
                className={styles.logoBellBtn}
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-label="Bildirişlər"
                title="Bildirişlər"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className={styles.logoBellBadge}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Desktop Nav Links */}
          <div className={styles.navLinks}>
            {navLinks.map((link, idx) => (
              link.onClick ? (
                <button
                  key={idx}
                  onClick={link.onClick}
                  className={styles.navBtn}
                >
                  {link.label}
                </button>
              ) : (
                <NavLink
                  key={link.to || idx}
                  to={link.to}
                  className={({ isActive }) => isActive ? styles.activeLink : ''}
                >
                  {link.label}
                </NavLink>
              )
            ))}
          </div>

          {/* Actions */}
          <div className={styles.navActions}>
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
                {!isSuperAdmin && !isVendor && (
                  <Link to="/panel" className={styles.adminBtn} title="İstifadəçi Paneli">
                    <User size={20} />
                  </Link>
                )}

                {/* Notification Bell — right next to profile icon */}
                <div className={styles.notifWrapper}>
                  <button 
                    className={styles.notifBtn} 
                    onClick={() => setIsNotifOpen(!isNotifOpen)} 
                    aria-label="Bildirişlər"
                    title="Bildirişlər"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className={styles.notifBadge}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <>
                        <div className={styles.langDropdownOverlay} onClick={() => setIsNotifOpen(false)} />
                        <motion.div 
                          className={styles.notifMenu}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                        >
                          <div className={styles.notifHeader}>
                            <div>
                              <h4>Bildirişlər 🔔</h4>
                              <span className={styles.notifSub}>{unreadCount} oxunmamış bildiriş</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {filteredNotifs.length > 0 && (
                                <>
                                  <button 
                                    className={styles.notifActionBtn}
                                    onClick={() => markAllAsRead(userEmail, storeId, isSuperAdmin)}
                                    title="Hamısını oxunmuş et"
                                  >
                                    <CheckCheck size={16} />
                                  </button>
                                  <button 
                                    className={styles.notifActionBtn}
                                    onClick={() => clearNotifications(userEmail, storeId, isSuperAdmin)}
                                    title="Təmizlə"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className={styles.notifList}>
                            {filteredNotifs.length === 0 ? (
                              <div className={styles.emptyNotif}>
                                <Bell size={32} style={{ opacity: 0.3 }} />
                                <p>Heç bir bildirişiniz yoxdur.</p>
                              </div>
                            ) : (
                              filteredNotifs.map(n => (
                                <div 
                                  key={n.id} 
                                  className={`${styles.notifItem} ${!n.read ? styles.unreadItem : ''}`}
                                  onClick={() => handleNotifClick(n)}
                                >
                                  <div className={styles.notifDot} style={{ background: !n.read ? '#D4AF37' : '#CBD5E1' }} />
                                  <div className={styles.notifContent}>
                                    <h5>{n.title}</h5>
                                    <p>{n.message}</p>
                                    <span className={styles.notifTime}>
                                      {new Date(n.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={handleLogout} className={styles.logoutBtn} title={t('navbar.logout')}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className={styles.loginBtn} title={t('navbar.login')}>
                <User size={18} />
                <span className={styles.loginText}>{t('navbar.login')}</span>
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
          {navLinks.map((link, idx) => (
            link.onClick ? (
              <button
                key={idx}
                onClick={() => { closeDrawer(); link.onClick(); }}
                className={styles.drawerLink}
                style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
              >
                {link.icon}
                {link.label}
              </button>
            ) : (
              <NavLink
                key={link.to || idx}
                to={link.to}
                onClick={closeDrawer}
                className={({ isActive }) =>
                  `${styles.drawerLink} ${isActive ? styles.drawerActive : ''}`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            )
          ))}

          {/* Notification Link in Drawer */}
          {user && (
            <button
              className={styles.drawerLink}
              onClick={() => { setIsDrawerOpen(false); setIsNotifOpen(true); }}
              style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', position: 'relative' }}
            >
              <Bell size={20} />
              Bildirişlər
              {unreadCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: '50%', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
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

