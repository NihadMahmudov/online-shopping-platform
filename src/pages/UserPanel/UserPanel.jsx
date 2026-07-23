import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Store, Heart, ShoppingCart, User as UserIcon, LogOut, Package, LayoutGrid, Menu, X, Home, ShoppingBag, MapPin, ArrowRight, Shield, Bell, CheckCheck, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { useProducts } from '../../context/ProductContext';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import Shop from '../Shop/Shop';
import Categories from '../Categories/Categories';
import Cart from '../Cart/Cart';
import Wishlist from '../Wishlist/Wishlist';
import Orders from '../Orders/Orders';
import AdminPanel from './AdminPanel';
import styles from './UserPanel.module.css';

const UserPanel = () => {
  const { user, logout, users } = useAuth();
  const { cartItemCount } = useCart();
  const { wishlist } = useWishlist();
  const { getStoreProfile } = useStore();
  const { products } = useProducts();
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
  const [storeSearchTerm, setStoreSearchTerm] = useState('');

  // Compute boutiques list
  const vendorsList = users.filter(u => u.role === 'vendor');
  const boutiques = vendorsList.map(v => {
    const profile = getStoreProfile(v.storeId) || {};
    const storeProductCount = products.filter(p => p.storeId === v.storeId).length;
    let badge = 'BUTİK';
    if (v.storeId === 'vogue_art') badge = 'YENİ';
    else if (v.storeId === 'modernist') badge = 'POPULYAR';
    else if (v.storeId === 'zarif_atelye') badge = 'ƏL İŞİ';
    else if (v.storeId === 'style_lab') badge = 'PREMİUM';
    else if (v.storeId === 'baku_closet') badge = 'TREND';
    else if (v.storeId === 'silk_way') badge = 'KLASSİK';
    else if (v.storeCategory) badge = v.storeCategory.toUpperCase();

    return {
      id: v.storeId,
      name: v.storeName || v.name,
      location: profile.address || 'Mingəçevir, Mərkəz',
      badge: badge,
      count: `${storeProductCount} məhsul`,
    };
  });

  const filteredBoutiques = boutiques.filter(b => 
    b.name.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
    b.location.toLowerCase().includes(storeSearchTerm.toLowerCase())
  );

  const { getFilteredNotifications, getUnreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const unreadCount = getUnreadCount(user?.email, user?.storeId, user?.role === 'superadmin');
  const notificationsList = getFilteredNotifications(user?.email, user?.storeId, user?.role === 'superadmin');

  const baseTabs = [
    { id: 'kataloq', label: 'Kataloq', icon: <ShoppingBag size={20} />, count: null },
    { id: 'categories', label: 'Kateqoriyalar', icon: <LayoutGrid size={20} />, count: null },
    { id: 'stores', label: 'Mağazalar', icon: <Store size={20} />, count: null },
    { id: 'wishlist', label: 'Sevimlilər', icon: <Heart size={20} />, count: wishlist.length },
    { id: 'cart', label: 'Səbət', icon: <ShoppingCart size={20} />, count: cartItemCount },
    { id: 'orders', label: 'Sifarişlər', icon: <Package size={20} />, count: null },
    { id: 'notifications', label: 'Bildirişlər', icon: <Bell size={20} />, count: unreadCount }
  ];

  const TABS = user?.role === 'superadmin'
    ? [...baseTabs, { id: 'admin', label: 'Admin Panel', icon: <Shield size={20} />, count: null }]
    : baseTabs;

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
        <button className={styles.mobileHomeBtn} onClick={() => setActiveTab('kataloq')} title="Kataloqa Keç">
          <ShoppingBag size={20} />
        </button>
        <div className={styles.logo} onClick={() => setActiveTab('kataloq')} style={{ cursor: 'pointer' }} title="Kataloqa Keç">
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
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Left Sidebar (hidden on mobile via CSS) */}
      <aside className={styles.sidebar}>
        <div className={styles.logo} onClick={() => setActiveTab('kataloq')} style={{ cursor: 'pointer' }} title="Kataloqa Keç">
          <span>Atlas</span><span className={styles.logoDot}>Mall</span>
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
            {activeTab === 'stores' && (
              <div className={styles.storesTab}>
                <div className={styles.tabHeader}>
                  <h2>Mağazalar</h2>
                  <p>AtlasMall platformasında fəaliyyət göstərən bütün premium butiklər ({filteredBoutiques.length})</p>
                </div>

                <div className={styles.storeSearchRow}>
                  <div className={styles.storeSearchBox}>
                    <Search size={18} className={styles.storeSearchIcon} />
                    <input 
                      type="text" 
                      placeholder="Mağaza adı və ya ünvan üzrə axtarın..." 
                      value={storeSearchTerm}
                      onChange={(e) => setStoreSearchTerm(e.target.value)}
                    />
                    {storeSearchTerm && (
                      <button className={styles.clearSearchBtn} onClick={() => setStoreSearchTerm('')} title="Təmizlə">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {filteredBoutiques.length > 0 ? (
                  <div className={styles.storesGrid}>
                    {filteredBoutiques.map(store => (
                      <div 
                        key={store.id} 
                        className={styles.storeCard}
                        onClick={() => navigate(`/store/${store.id}`)}
                      >
                        <div className={styles.storeCardHeader}>
                          <div className={styles.storeAvatar}>
                            {store.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className={styles.storeName}>{store.name}</h3>
                            <span className={styles.storeBadge}>{store.badge}</span>
                          </div>
                        </div>
                        <div className={styles.storeDetails}>
                          <div className={styles.storeDetailItem}>
                            <MapPin size={14} className={styles.storeDetailIcon} />
                            <span>{store.location}</span>
                          </div>
                          <div className={styles.storeDetailItem}>
                            <Store size={14} className={styles.storeDetailIcon} />
                            <span>{store.count}</span>
                          </div>
                        </div>
                        <button className={styles.storeActionBtn}>
                          Mağazaya bax <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noStoresFound}>
                    <Store size={48} className={styles.noStoresIcon} />
                    <h3>Mağaza tapılmadı</h3>
                    <p>"{storeSearchTerm}" axtarışına uyğun heç bir mağaza tapılmadı.</p>
                    <button className={styles.resetSearchBtn} onClick={() => setStoreSearchTerm('')}>
                      Axtarışı sıfırla
                    </button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'wishlist' && <Wishlist inPanel={true} />}
            {activeTab === 'cart' && <Cart inPanel={true} />}
            {activeTab === 'orders' && <Orders inPanel={true} />}
            {activeTab === 'notifications' && (
              <div style={{ padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>Bildirişlər və Mesajlar 🔔</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SuperAdmin elanları, mağaza bildirişləri və sifariş yenilənmələriniz</p>
                  </div>
                  {notificationsList.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => markAllAsRead(user?.email, user?.storeId, user?.role === 'superadmin')}
                        style={{ padding: '8px 14px', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <CheckCheck size={16} /> Hamısını Oxunmuş Et
                      </button>
                      <button 
                        onClick={() => clearNotifications(user?.email, user?.storeId, user?.role === 'superadmin')}
                        style={{ padding: '8px 14px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Trash2 size={16} /> Təmizlə
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notificationsList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <Bell size={48} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '12px' }} />
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '4px' }}>Bildirişiniz yoxdur</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sizə göndərilən bütün rəsmi mesajlar və sifariş yenilənmələri burada görünəcək.</p>
                    </div>
                  ) : (
                    notificationsList.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        style={{
                          background: !n.read ? 'rgba(212, 175, 55, 0.06)' : 'var(--white)',
                          border: !n.read ? '1.5px solid rgba(212, 175, 55, 0.3)' : '1px solid var(--border)',
                          borderRadius: '14px',
                          padding: '16px 20px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '50px', background: '#F1F5F9', color: '#334155', fontSize: '0.75rem', fontWeight: 700 }}>
                              {n.sender || '🔔 Sistem Bildirişi'}
                            </span>
                            {!n.read && (
                              <span style={{ padding: '2px 8px', borderRadius: '50px', background: '#EF4444', color: '#FFF', fontSize: '0.65rem', fontWeight: 800 }}>YENİ</span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(n.createdAt).toLocaleDateString('az-AZ')} {new Date(n.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--secondary)', margin: '0 0 4px' }}>{n.title}</h4>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-color)', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === 'admin' && <AdminPanel />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className={styles.mobileBottomBar}>
        {TABS.filter(tab => tab.id !== 'stores' && tab.id !== 'admin' && tab.id !== 'notifications').map(tab => (
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
