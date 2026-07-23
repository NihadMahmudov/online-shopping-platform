import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Store, Users, ShoppingBag, LogOut,
  TrendingUp, CheckCircle, XCircle, Trash2, ShieldAlert,
  Clock, Calendar, UserCheck, UserX, Menu, X, ArrowLeft, Tag, PlusCircle,
  Camera, ImagePlus, Award, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useNotifications } from '../../context/NotificationContext';
import styles from './Dashboard.module.css';

const TABS = ['Mağazalar', 'İstifadəçilər', 'Sifarişlər', 'Kateqoriyalar', 'Kolleksiya və Etiketlər', 'Ana Səhifə Vitrini', 'Kütləvi Bildiriş', 'Analitika'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    user, users, customers, vendors, logout,
    deleteUser, suspendUser, approveVendor, rejectVendor 
  } = useAuth();
  
  const { 
    products, 
    categories, 
    addCategory, 
    deleteCategory, 
    updateCategoryImage, 
    showcaseCards, 
    updateShowcaseCard,
    badges,
    addBadge,
    deleteBadge,
    collections,
    addCollection,
    deleteCollection
  } = useProducts();
  const { orders, updateOrderStatus, getTotalRevenue, getRevenueByStore } = useOrders();
  const { broadcastNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('Mağazalar');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [catSuccess, setCatSuccess] = useState(false);

  const [newBadgeLabel, setNewBadgeLabel] = useState('');
  const [newCollectionLabel, setNewCollectionLabel] = useState('');
  const [badgeSuccess, setBadgeSuccess] = useState(false);
  const [collectionSuccess, setCollectionSuccess] = useState(false);

  // Broadcast Notification States
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    broadcastNotification({
      targetGroup: broadcastTarget,
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      sender: '👑 AtlasMall SuperAdmin'
    });

    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleAddBadge = (e) => {
    e.preventDefault();
    if (newBadgeLabel.trim()) {
      addBadge(newBadgeLabel.trim());
      setNewBadgeLabel('');
      setBadgeSuccess(true);
      setTimeout(() => setBadgeSuccess(false), 2000);
    }
  };

  const handleAddCollection = (e) => {
    e.preventDefault();
    if (newCollectionLabel.trim()) {
      addCollection(newCollectionLabel.trim());
      setNewCollectionLabel('');
      setCollectionSuccess(true);
      setTimeout(() => setCollectionSuccess(false), 2000);
    }
  };

  const handleCategoryImageUpload = (e, catId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateCategoryImage(catId, reader.result);
        setCatSuccess(true);
        setTimeout(() => setCatSuccess(false), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Redirect if not superadmin
  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'superadmin') {
    return null;
  }

  // Filter vendors based on search
  const filteredVendors = vendors.filter(v => 
    v.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter customers based on search
  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter orders based on search
  const filteredOrders = orders.filter(o => 
    o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPlatformRevenue = getTotalRevenue();

  const stats = [
    { label: 'Ümumi Mağazalar', value: vendors.length, icon: <Store size={22} />, color: '#D4AF37' },
    { label: 'Qeydiyyatlı Müştərilər', value: customers.length, icon: <Users size={22} />, color: '#2A9D8F' },
    { label: 'Cari Məhsullar', value: products.length, icon: <ShoppingBag size={22} />, color: '#E63946' },
    { label: 'Platform Gəliri', value: `${totalPlatformRevenue} AZN`, icon: <TrendingUp size={22} />, color: '#4361ee' },
  ];

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    addCategory(newCatLabel.trim());
    setNewCatLabel('');
    setCatSuccess(true);
    setTimeout(() => setCatSuccess(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Mobile Top Bar */}
      <header className={styles.mobileHeader}>
        <button className={styles.menuToggle} onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <div className={styles.sidebarLogo}>Atlas<span>Mall Admin</span></div>
        <div className={styles.mobileAvatar}>A</div>
      </header>

      {/* Slide Drawer for Mobile */}
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
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={styles.sidebarDrawer}
            >
              <div className={styles.drawerHeader}>
                <div className={styles.sidebarLogo}>Atlas<span>Mall</span></div>
                <button className={styles.closeBtn} onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.storeInfo}>
                <div className={styles.storeAvatar}>A</div>
                <div>
                  <p className={styles.storeName}>Super Admin</p>
                  <p className={styles.storeEmail}>{user.email}</p>
                  <span className="badge-pending" style={{ fontSize: '10px' }}>Platform Control</span>
                </div>
              </div>

              <nav className={styles.sideNav}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    className={`${styles.navItem} ${activeTab === tab ? styles.navActive : ''}`}
                    onClick={() => {
                      setActiveTab(tab);
                      setSearchQuery('');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {tab === 'Mağazalar' ? <Store size={18} /> : 
                     tab === 'İstifadəçilər' ? <Users size={18} /> : 
                     tab === 'Sifarişlər' ? <ShoppingBag size={18} /> : 
                     tab === 'Kateqoriyalar' ? <Tag size={18} /> :
                     tab === 'Kolleksiya və Etiketlər' ? <Award size={18} /> :
                     tab === 'Ana Səhifə Vitrini' ? <LayoutDashboard size={18} /> :
                     <TrendingUp size={18} />}
                    {tab}
                  </button>
                ))}
              </nav>

              <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
                <LogOut size={18} /> Çıxış
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo} onClick={() => setActiveTab('Mağazalar')} style={{ cursor: 'pointer' }}>Atlas<span>Mall Admin</span></div>

        <div className={styles.storeInfo}>
          <div className={styles.storeAvatar}>A</div>
          <div>
            <p className={styles.storeName}>Super Admin</p>
            <p className={styles.storeEmail}>{user.email}</p>
            <span className="badge-pending" style={{ fontSize: '10px' }}>Platform Control</span>
          </div>
        </div>

        <nav className={styles.sideNav}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.navItem} ${activeTab === tab ? styles.navActive : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery('');
              }}
            >
              {tab === 'Mağazalar' ? <Store size={18} /> : 
               tab === 'İstifadəçilər' ? <Users size={18} /> : 
               tab === 'Sifarişlər' ? <ShoppingBag size={18} /> : 
               tab === 'Kateqoriyalar' ? <Tag size={18} /> :
               tab === 'Kolleksiya və Etiketlər' ? <Award size={18} /> :
               tab === 'Ana Səhifə Vitrini' ? <LayoutDashboard size={18} /> :
               <TrendingUp size={18} />}
              {tab}
            </button>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={18} /> Çıxış
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <div>
            <h1>Platforma İdarəetmə Paneli 👋</h1>
            <p>AtlasMall mağazalarını, istifadəçilərini və ümumi performansı tənzimləyin.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((s, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: `${s.color}20`, color: s.color }}>
                {s.icon}
              </div>
              <div className={styles.statDetails}>
                <span className={styles.statLabel}>{s.label}</span>
                <h2 className={styles.statValue}>{s.value}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        {activeTab !== 'Analitika' && activeTab !== 'Kateqoriyalar' && (
          <div className={styles.searchContainer}>
            <input 
              type="text" 
              placeholder={`${activeTab} üzrə axtarış...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchBar}
            />
          </div>
        )}

        {/* Tab Content */}
        <div className={styles.tabContent}>
          <AnimatePresence mode="wait">
            
            {/* ── STORES TAB ── */}
            {activeTab === 'Mağazalar' && (
              <motion.div
                key="stores"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2>Mağazalar Siyahısı ({filteredVendors.length})</h2>
                </div>

                {/* Desktop Table */}
                <div className={`${styles.tableCard} ${styles.desktopOnly}`}>
                  <div className={styles.table}>
                    <div className={styles.tableHeaderStores}>
                      <span>Mağaza Adı</span>
                      <span>E-poçt</span>
                      <span>Kateqoriya</span>
                      <span>Məhsul Sayı</span>
                      <span>Status</span>
                      <span>İdarəetmə</span>
                    </div>
                    {filteredVendors.length === 0 ? (
                      <div className={styles.noData}>Heç bir mağaza tapılmadı.</div>
                    ) : (
                      filteredVendors.map(v => {
                        const storeProductCount = products.filter(p => p.storeId === v.storeId).length;
                        return (
                          <div key={v.email} className={styles.tableRowStores}>
                            <div className={styles.storeCell}>
                              <strong>{v.storeName}</strong>
                              <span className={styles.phoneText}>{v.phone || 'Nömrə yoxdur'}</span>
                            </div>
                            <span>{v.email}</span>
                            <span className={styles.catTag}>{v.storeCategory || 'Hədiyyə'}</span>
                            <span>{storeProductCount} ədəd</span>
                            <span>
                              <span className={`${styles.statusBadge} ${
                                v.status === 'approved' ? styles.statusApproved :
                                v.status === 'pending' ? styles.statusPending :
                                v.status === 'rejected' ? styles.statusRejected :
                                styles.statusSuspended
                              }`}>
                                {v.status === 'approved' && <CheckCircle size={14} className={styles.badgeIcon} />}
                                {v.status === 'pending' && <Clock size={14} className={styles.badgeIcon} />}
                                {v.status === 'suspended' && <UserX size={14} className={styles.badgeIcon} />}
                                {v.status === 'rejected' && <XCircle size={14} className={styles.badgeIcon} />}
                                {v.status === 'approved' ? 'Aktiv' :
                                 v.status === 'pending' ? 'Gözləmədə' :
                                 v.status === 'rejected' ? 'Rədd edilib' : 'Dondurulub'}
                              </span>
                            </span>
                            <div className={styles.storeActions}>
                              {v.status === 'pending' && (
                                <>
                                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className={styles.approveBtn} onClick={() => approveVendor(v.email)}>
                                    <CheckCircle size={16} /> Təsdiqlə
                                  </motion.button>
                                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className={styles.rejectBtn} onClick={() => rejectVendor(v.email)}>
                                    <XCircle size={16} /> Rədd Et
                                  </motion.button>
                                </>
                              )}
                              {v.status === 'approved' && (
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                  className={styles.suspendBtn} onClick={() => suspendUser(v.email)}>
                                  <UserX size={16} /> Hesabı Dondur
                                </motion.button>
                              )}
                              {v.status === 'suspended' && (
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                  className={styles.activateBtn} onClick={() => suspendUser(v.email)}>
                                  <UserCheck size={16} /> Aktivləşdir
                                </motion.button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className={styles.mobileCards}>
                  {filteredVendors.length === 0 ? (
                    <div className={styles.noData}>Heç bir mağaza tapılmadı.</div>
                  ) : (
                    filteredVendors.map(v => {
                      const storeProductCount = products.filter(p => p.storeId === v.storeId).length;
                      const statusColor = v.status === 'approved' ? '#059669' : v.status === 'pending' ? '#D97706' : v.status === 'rejected' ? '#6B7280' : '#DC2626';
                      return (
                        <div key={v.email} className={styles.premiumCard}>
                          <div className={styles.premiumCardAccent} style={{ background: `linear-gradient(90deg, ${statusColor}22, transparent)`, borderLeft: `3px solid ${statusColor}` }} />
                          <div className={styles.premiumCardTop}>
                            <div className={styles.premiumAvatar} style={{ background: `linear-gradient(135deg, ${statusColor}30, ${statusColor}15)`, color: statusColor, border: `1.5px solid ${statusColor}40` }}>
                              {v.storeName?.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.premiumCardInfo}>
                              <h3>{v.storeName}</h3>
                              <p>{v.phone || v.email}</p>
                            </div>
                            <span className={`${styles.statusBadge} ${
                              v.status === 'approved' ? styles.statusApproved :
                              v.status === 'pending' ? styles.statusPending :
                              v.status === 'rejected' ? styles.statusRejected :
                              styles.statusSuspended
                            }`}>
                              {v.status === 'approved' && <CheckCircle size={12} />}
                              {v.status === 'pending' && <Clock size={12} />}
                              {v.status === 'suspended' && <UserX size={12} />}
                              {v.status === 'rejected' && <XCircle size={12} />}
                              {v.status === 'approved' ? 'Aktiv' : v.status === 'pending' ? 'Gözləmə' : v.status === 'rejected' ? 'Rədd' : 'Dondu'}
                            </span>
                          </div>
                          <div className={styles.premiumCardChips}>
                            <div className={styles.chip}>
                              <span className={styles.chipIcon}>📧</span>
                              <span>{v.email}</span>
                            </div>
                            <div className={styles.chipRow}>
                              <div className={styles.chip}>
                                <span className={styles.chipIcon}>🏷️</span>
                                <span>{v.storeCategory || 'Hədiyyə'}</span>
                              </div>
                              <div className={styles.chip}>
                                <span className={styles.chipIcon}>📦</span>
                                <span>{storeProductCount} məhsul</span>
                              </div>
                            </div>
                          </div>
                          {(v.status === 'pending' || v.status === 'approved' || v.status === 'suspended') && (
                            <div className={styles.premiumCardActions}>
                              {v.status === 'pending' && (
                                <>
                                  <motion.button whileTap={{ scale: 0.97 }}
                                    className={styles.actionBtnGreen}
                                    onClick={() => approveVendor(v.email)}>
                                    <CheckCircle size={15} /> Təsdiqlə
                                  </motion.button>
                                  <motion.button whileTap={{ scale: 0.97 }}
                                    className={styles.actionBtnRed}
                                    onClick={() => rejectVendor(v.email)}>
                                    <XCircle size={15} /> Rədd Et
                                  </motion.button>
                                </>
                              )}
                              {v.status === 'approved' && (
                                <motion.button whileTap={{ scale: 0.97 }}
                                  className={styles.actionBtnOrange}
                                  onClick={() => suspendUser(v.email)}>
                                  <UserX size={15} /> Dondur
                                </motion.button>
                              )}
                              {v.status === 'suspended' && (
                                <motion.button whileTap={{ scale: 0.97 }}
                                  className={styles.actionBtnGreen}
                                  onClick={() => suspendUser(v.email)}>
                                  <UserCheck size={15} /> Aktivləşdir
                                </motion.button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* ── CUSTOMERS TAB ── */}
            {activeTab === 'İstifadəçilər' && (
              <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className={styles.sectionHeader}>
                  <h2>Müştərilər Siyahısı ({filteredCustomers.length})</h2>
                </div>

                {/* Desktop Table */}
                <div className={`${styles.tableCard} ${styles.desktopOnly}`}>
                  <div className={styles.table}>
                    <div className={styles.tableHeaderCustomers}>
                      <span>Müştəri</span><span>E-poçt</span><span>Qeydiyyat Tarixi</span><span>Status</span><span>Əməliyyat</span>
                    </div>
                    {filteredCustomers.length === 0 ? (
                      <div className={styles.noData}>Müştəri tapılmadı.</div>
                    ) : (
                      filteredCustomers.map(c => (
                        <div key={c.email} className={styles.tableRowCustomers}>
                          <div className={styles.customerCell}>
                            <div className={styles.custAvatar}>{c.name?.charAt(0).toUpperCase()}</div>
                            <strong>{c.name}</strong>
                          </div>
                          <span>{c.email}</span>
                          <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('az-AZ') : 'Tarix yoxdur'}</span>
                          <span>
                            <span className={`${styles.statusBadge} ${c.status === 'suspended' ? styles.statusSuspended : styles.statusApproved}`}>
                              {c.status === 'suspended' ? <UserX size={14} className={styles.badgeIcon} /> : <CheckCircle size={14} className={styles.badgeIcon} />}
                              {c.status === 'suspended' ? 'Dondurulub' : 'Aktiv'}
                            </span>
                          </span>
                          <div className={styles.customerActions}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className={c.status === 'suspended' ? styles.activateBtnIcon : styles.suspendBtnIcon}
                              onClick={() => suspendUser(c.email)}>
                              {c.status === 'suspended' ? <UserCheck size={16} /> : <UserX size={16} />}
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              className={styles.deleteBtn} onClick={() => deleteUser(c.email)}>
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className={styles.mobileCards}>
                  {filteredCustomers.length === 0 ? (
                    <div className={styles.noData}>Müştəri tapılmadı.</div>
                  ) : (
                    filteredCustomers.map(c => (
                      <div key={c.email} className={styles.premiumCard}>
                        <div className={styles.premiumCardTop}>
                          <div className={styles.premiumAvatar} style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))', color: '#9A7D0A', border: '1.5px solid rgba(212,175,55,0.3)' }}>
                            {c.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className={styles.premiumCardInfo}>
                            <h3>{c.name}</h3>
                            <p>{c.email}</p>
                          </div>
                          <span className={`${styles.statusBadge} ${c.status === 'suspended' ? styles.statusSuspended : styles.statusApproved}`}>
                            {c.status === 'suspended' ? <UserX size={12} /> : <CheckCircle size={12} />}
                            {c.status === 'suspended' ? 'Dondu' : 'Aktiv'}
                          </span>
                        </div>
                        <div className={styles.premiumCardChips}>
                          <div className={styles.chip}>
                            <span className={styles.chipIcon}>📅</span>
                            <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('az-AZ') : 'Tarix yoxdur'}</span>
                          </div>
                        </div>
                        <div className={styles.premiumCardActions}>
                          <motion.button whileTap={{ scale: 0.97 }}
                            className={c.status === 'suspended' ? styles.actionBtnGreen : styles.actionBtnOrange}
                            onClick={() => suspendUser(c.email)}>
                            {c.status === 'suspended' ? <><UserCheck size={15} /> Aktivləşdir</> : <><UserX size={15} /> Dondur</>}
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.97 }}
                            className={styles.actionBtnGhost}
                            onClick={() => deleteUser(c.email)}>
                            <Trash2 size={15} /> Sil
                          </motion.button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === 'Sifarişlər' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className={styles.sectionHeader}>
                  <h2>Bütün Platforma Sifarişləri ({filteredOrders.length})</h2>
                </div>

                {/* Desktop Table */}
                <div className={`${styles.tableCard} ${styles.desktopOnly}`}>
                  <div className={styles.table}>
                    <div className={styles.tableHeaderOrders}>
                      <span>Sifariş İD</span><span>Müştəri</span><span>Tarix</span><span>Məbləğ</span><span>Status</span><span>İdarəetmə</span>
                    </div>
                    {filteredOrders.length === 0 ? (
                      <div className={styles.noData}>Sifariş tapılmadı.</div>
                    ) : (
                      filteredOrders.map(o => (
                        <div key={o.id} className={styles.tableRowOrders}>
                          <span className={styles.orderId}>{o.id}</span>
                          <div className={styles.customerDetailsCell}>
                            <strong>{o.customerName}</strong>
                            <span>{o.email}</span>
                          </div>
                          <span>{new Date(o.createdAt).toLocaleDateString('az-AZ')}</span>
                          <span className={styles.priceCell}>{o.total} AZN</span>
                          <span>
                            <span className={o.status === 'delivered' ? 'badge-approved' : o.status === 'pending' ? 'badge-pending' : o.status === 'cancelled' ? 'badge-suspended' : 'badge-rejected'}>
                              {o.status === 'pending' ? 'Gözləmədə' : o.status === 'approved' ? 'Təsdiqləndi' : o.status === 'shipped' ? 'Yoldadır' : o.status === 'delivered' ? 'Çatdırıldı' : 'Ləğv edilib'}
                            </span>
                          </span>
                          <div>
                            <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className={styles.statusSelect}>
                              <option value="pending">Gözləmədə</option>
                              <option value="approved">Təsdiqləndi</option>
                              <option value="shipped">Yoldadır</option>
                              <option value="delivered">Çatdırıldı</option>
                              <option value="cancelled">Ləğv et</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className={styles.mobileCards}>
                  {filteredOrders.length === 0 ? (
                    <div className={styles.noData}>Sifariş tapılmadı.</div>
                  ) : (
                    filteredOrders.map(o => (
                      <div key={o.id} className={styles.premiumCard}>
                        <div className={styles.premiumCardTop}>
                          <div className={styles.premiumAvatar} style={{ background: 'linear-gradient(135deg, rgba(67,97,238,0.15), rgba(67,97,238,0.05))', color: '#4361ee', border: '1.5px solid rgba(67,97,238,0.25)', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                            #{o.id?.slice(-3)}
                          </div>
                          <div className={styles.premiumCardInfo}>
                            <h3>{o.customerName}</h3>
                            <p>{o.email}</p>
                          </div>
                          <span className={styles.orderPriceTag}>{o.total} AZN</span>
                        </div>
                        <div className={styles.premiumCardChips}>
                          <div className={styles.chipRow}>
                            <div className={styles.chip}>
                              <span className={styles.chipIcon}>📅</span>
                              <span>{new Date(o.createdAt).toLocaleDateString('az-AZ')}</span>
                            </div>
                            <div className={styles.chip}>
                              <span className={styles.chipIcon}>📦</span>
                              <span>{o.status === 'pending' ? 'Gözləmə' : o.status === 'approved' ? 'Təsdiq' : o.status === 'shipped' ? 'Yolda' : o.status === 'delivered' ? 'Çatdı' : 'Ləğv'}</span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.premiumCardActions}>
                          <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className={styles.mobileSelect}>
                            <option value="pending">Gözləmədə</option>
                            <option value="approved">Təsdiqləndi</option>
                            <option value="shipped">Yoldadır</option>
                            <option value="delivered">Çatdırıldı</option>
                            <option value="cancelled">Ləğv et</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* ── CATEGORIES TAB (superadmin only) ── */}
            {activeTab === 'Kateqoriyalar' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2>Məhsul Kateqoriyaları</h2>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '4px' }}>Platforma kateqoriyalarını idarə edin. Mağazalar yalnız bu kateqoriyalar üzrə məhsul əlavə edə bilərlər.</p>
                </div>

                {catSuccess && (
                  <div style={{ background: 'rgba(42, 157, 143, 0.12)', border: '1px solid rgba(42,157,143,0.3)', color: '#2a9d8f', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>
                    ✅ Kateqoriya uğurla əlavə edildi!
                  </div>
                )}

                <div className={styles.tableCard} style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ color: '#1E293B', marginBottom: '16px', fontSize: '1rem' }}>Yeni Kateqoriya Əlavə Et</h3>
                  <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      placeholder="Kateqoriya adı (məs: Elektronika, Geyim...)"
                      className={styles.searchBar}
                      style={{ flex: 1, margin: 0 }}
                      required
                    />
                    <button
                      type="submit"
                      className={styles.approveBtn}
                      style={{ whiteSpace: 'nowrap', padding: '10px 20px' }}
                    >
                      <PlusCircle size={16} /> Əlavə Et
                    </button>
                  </form>
                </div>

                <div className={styles.tableCard}>
                  <div className={styles.table}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <span>Kateqoriya Adı</span>
                      <span>Məhsul Sayı</span>
                      <span>Əməliyyat</span>
                    </div>
                    {categories.filter(c => c.id !== 'all' && !c.storeId).length === 0 ? (
                      <div className={styles.noData}>Kateqoriya tapılmadı. Yeni kateqoriya əlavə edin.</div>
                    ) : (
                      categories.filter(c => c.id !== 'all' && !c.storeId).map(cat => {
                        const productCount = products.filter(p => p.category === cat.id).length;
                        return (
                          <div key={cat.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '14px 24px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.95rem', transition: 'background 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className={styles.catImageWrapper}>
                                {cat.img ? (
                                  <img src={cat.img} alt={cat.label} className={styles.catImage} />
                                ) : (
                                  <Tag size={16} style={{ color: '#D4AF37' }} />
                                )}
                                <label className={styles.catImageUploadOverlay} title="Şəkli Dəyişdir">
                                  <Camera size={14} />
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleCategoryImageUpload(e, cat.id)} 
                                    style={{ display: 'none' }} 
                                  />
                                </label>
                              </div>
                              <strong style={{ color: '#1E293B' }}>{cat.label}</strong>
                            </div>
                            <span className={styles.catTag}>{productCount} məhsul</span>
                            <div>
                              <button
                                className={styles.rejectBtn}
                                onClick={() => deleteCategory(cat.id)}
                                title="Sil"
                              >
                                <Trash2 size={14} /> Sil
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── COLLECTIONS & BADGES MANAGEMENT ── */}
            {activeTab === 'Kolleksiya və Etiketlər' && (
              <motion.div
                key="collections-badges"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2 style={{ color: '#0F172A', fontWeight: 700, fontSize: '1.5rem' }}>Kolleksiyalar və Etiketlər</h2>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
                    Platformadakı məhsulların qruplaşdırılmasını (Kolleksiyalar) və vizual etiketləri (Yeni, Bestseller, Endirim...) idarə edin.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                  {/* --- Collections Box --- */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', height: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} style={{ color: '#D4AF37' }} />
                      Məhsul Kolleksiyaları
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.5' }}>
                      Kolleksiyalar məhsulları ana səhifə, brend vitrinləri və xüsusi filtr tablarında qruplaşdırmaq üçün istifadə olunur (məs. Flaş, Bestseller, Endirimli).
                    </p>

                    {collectionSuccess && (
                      <div style={{ background: 'rgba(42, 157, 143, 0.12)', border: '1px solid rgba(42,157,143,0.3)', color: '#2a9d8f', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: 600 }}>
                        ✅ Kolleksiya uğurla əlavə edildi!
                      </div>
                    )}

                    <form onSubmit={handleAddCollection} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <input
                        type="text"
                        value={newCollectionLabel}
                        onChange={(e) => setNewCollectionLabel(e.target.value)}
                        placeholder="Kolleksiya adı (məs: Trend, Yeni Sezon...)"
                        className={styles.searchBar}
                        style={{ flex: 1, margin: 0, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.9rem', background: '#F8FAFC', outline: 'none' }}
                        required
                      />
                      <button
                        type="submit"
                        className={styles.approveBtn}
                        style={{ padding: '10px 16px', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', background: '#D4AF37', color: '#1a1a1a', border: 'none', cursor: 'pointer' }}
                      >
                        <PlusCircle size={16} /> Əlavə Et
                      </button>
                    </form>

                    <div style={{ border: '1px solid #F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '12px 16px', background: '#F8FAFC', fontWeight: 700, color: '#8492a6', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                        <span>Kolleksiya Adı</span>
                        <span>Məhsul Sayı</span>
                        <span style={{ textAlign: 'right' }}>Sil</span>
                      </div>
                      {collections.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Heç bir kolleksiya yoxdur.</div>
                      ) : (
                        collections.map(coll => {
                          const productCount = products.filter(p => p.collections?.includes(coll.id)).length;
                          return (
                            <div key={coll.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '12px 16px', alignItems: 'center', borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem' }}>
                              <strong style={{ color: '#1E293B', fontWeight: 600 }}>{coll.label}</strong>
                              <span style={{ color: '#64748B' }}>{productCount} məhsul</span>
                              <div style={{ textAlign: 'right' }}>
                                <button
                                  type="button"
                                  className={styles.rejectBtn}
                                  onClick={() => deleteCollection(coll.id)}
                                  style={{ padding: '6px', borderRadius: '6px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                  title="Kolleksiyanı Sil"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* --- Badges Box --- */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', height: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={18} style={{ color: '#D4AF37' }} />
                      Məhsul Etiketləri (Badges)
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.5' }}>
                      Etiketlər məhsul kartlarının künclərində kiçik vizual nişanlar olaraq görünür (məs. Yeni, Bestseller, Endirim, Limitli).
                    </p>

                    {badgeSuccess && (
                      <div style={{ background: 'rgba(42, 157, 143, 0.12)', border: '1px solid rgba(42,157,143,0.3)', color: '#2a9d8f', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: 600 }}>
                        ✅ Etiket uğurla əlavə edildi!
                      </div>
                    )}

                    <form onSubmit={handleAddBadge} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <input
                        type="text"
                        value={newBadgeLabel}
                        onChange={(e) => setNewBadgeLabel(e.target.value)}
                        placeholder="Etiket adı (məs: Populyar, Eksklüziv...)"
                        className={styles.searchBar}
                        style={{ flex: 1, margin: 0, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '0.9rem', background: '#F8FAFC', outline: 'none' }}
                        required
                      />
                      <button
                        type="submit"
                        className={styles.approveBtn}
                        style={{ padding: '10px 16px', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', background: '#D4AF37', color: '#1a1a1a', border: 'none', cursor: 'pointer' }}
                      >
                        <PlusCircle size={16} /> Əlavə Et
                      </button>
                    </form>

                    <div style={{ border: '1px solid #F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '12px 16px', background: '#F8FAFC', fontWeight: 700, color: '#8492a6', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                        <span>Etiket Adı</span>
                        <span>Məhsul Sayı</span>
                        <span style={{ textAlign: 'right' }}>Sil</span>
                      </div>
                      {badges.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Heç bir etiket yoxdur.</div>
                      ) : (
                        badges.map(badge => {
                          const productCount = products.filter(p => p.badge === badge).length;
                          return (
                            <div key={badge} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '12px 16px', alignItems: 'center', borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem' }}>
                              <strong style={{ color: '#1E293B', fontWeight: 600 }}>{badge}</strong>
                              <span style={{ color: '#64748B' }}>{productCount} məhsul</span>
                              <div style={{ textAlign: 'right' }}>
                                <button
                                  type="button"
                                  className={styles.rejectBtn}
                                  onClick={() => deleteBadge(badge)}
                                  style={{ padding: '6px', borderRadius: '6px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                  title="Etiketi Sil"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── LANDING PAGE SHOWCASE TAB ── */}
            {activeTab === 'Ana Səhifə Vitrini' && (
              <motion.div
                key="showcase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2 style={{ color: '#0F172A', fontWeight: 700, fontSize: '1.5rem' }}>Ana Səhifə Vitrin Kartlarının İdarəedilməsi</h2>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>Ana Səhifədə (Landing Page) yerləşən bütün reklam və dizayn kartlarının şəkillərini, başlıqlarını, düymə mətnlərini və keçid linklərini buradan canlı tənzimləyin.</p>
                </div>

                <div className={styles.showcaseGrid}>
                  {showcaseCards?.map((card) => (
                    <div key={card.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div className={styles.showcaseCardImgContainer}>
                        <img src={card.img} alt={card.title} />
                        <label className={styles.showcaseCardUploadOverlay} title="Şəkli Dəyişdir">
                          <Camera size={18} />
                          <span>Şəkli Dəyişdir</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updateShowcaseCard(card.id, { img: reader.result });
                                  setCatSuccess(true);
                                  setTimeout(() => setCatSuccess(false), 2000);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                      </div>
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: card.type === 'main' ? '#EEF2FF' : card.type === 'right' ? '#ECFDF5' : '#FDF2F8', color: card.type === 'main' ? '#4F46E5' : card.type === 'right' ? '#059669' : '#DB2777', textTransform: 'uppercase' }}>
                            {card.type === 'main' ? 'Sol Böyük Kart' : card.type === 'right' ? 'Sağ Panel Kartı' : 'Aşağı Panel Kartı'}
                          </span>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '4px' }}>Başlıq</label>
                          <input 
                            type="text" 
                            value={card.title} 
                            onChange={(e) => updateShowcaseCard(card.id, { title: e.target.value })}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                          />
                        </div>

                        {card.type !== 'right' && (
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '4px' }}>Alt Başlıq / Düymə</label>
                            <input 
                              type="text" 
                              value={card.subtitle || ''} 
                              onChange={(e) => updateShowcaseCard(card.id, { subtitle: e.target.value })}
                              style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                            />
                          </div>
                        )}

                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '4px' }}>🏷️ Kateqoriyaya Əlaqələndir</label>
                          <select
                            value={card.linkedCategory || ''}
                            onChange={(e) => {
                              const catId = e.target.value;
                              if (catId === '') {
                                updateShowcaseCard(card.id, { linkedCategory: '', link: '/shop' });
                              } else {
                                updateShowcaseCard(card.id, { linkedCategory: catId, link: `/shop?category=${catId}` });
                              }
                            }}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem', background: '#F8FAFC', cursor: 'pointer' }}
                          >
                            <option value="">-- Kateqoriya seçin --</option>
                            <option value="all">🛍️ Hamısı (Bütün Məhsullar)</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.label || cat.name || cat.id}</option>
                            ))}
                          </select>
                          {card.linkedCategory && (
                            <div style={{ marginTop: '6px', padding: '6px 10px', background: 'rgba(212,175,55,0.08)', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.7rem', color: '#92751f' }}>🔗</span>
                              <span style={{ fontSize: '0.72rem', color: '#7C6A1A', fontWeight: 600, fontFamily: 'monospace' }}>{card.link}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '4px' }}>Xüsusi Keçid Linki (İstəyə görə)</label>
                          <input 
                            type="text" 
                            value={card.link} 
                            onChange={(e) => updateShowcaseCard(card.id, { link: e.target.value, linkedCategory: '' })}
                            placeholder="/shop?category=decor"
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── BROADCAST NOTIFICATION TAB ── */}
            {activeTab === 'Kütləvi Bildiriş' && (
              <motion.div
                key="broadcast"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2 style={{ color: '#0F172A', fontWeight: 700, fontSize: '1.5rem' }}>📢 Kütləvi Bildiriş və Mesaj Göndərilməsi</h2>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>Bütün platforma istifadəçilərinə və ya mağaza sahiblərinə rəsmi bildirişlər, elanlar və kampaniya mesajları göndərin.</p>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', maxWidth: '680px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  {broadcastSuccess && (
                    <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #10B981', color: '#047857', borderRadius: '10px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🎉</span> Kütləvi bildiriş bütün hədəf istifadəçilərə uğurla çatdırıldı!
                    </div>
                  )}

                  <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>🎯 Hədəf Auditoriya</label>
                      <select 
                        value={broadcastTarget} 
                        onChange={(e) => setBroadcastTarget(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', background: '#F8FAFC', cursor: 'pointer', fontWeight: 600, color: '#1E293B' }}
                      >
                        <option value="all">👥 Bütün İstifadəçilər və Mağaza Sahibləri (Hamı)</option>
                        <option value="customers">🛍️ Yalnız Müştərilər (İstifadəçilər)</option>
                        <option value="vendors">🏪 Yalnız Mağaza Sahibləri (Vendors)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>📌 Mesaj Başlığı *</label>
                      <input 
                        type="text" 
                        placeholder="Məs: Böyük Yay Endirimləri Başladı! 🎉" 
                        value={broadcastTitle} 
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>📝 Mesaj Mətni *</label>
                      <textarea 
                        rows="5"
                        placeholder="İstifadəçilərə çatdırılacaq elan və ya mesaj mətni..." 
                        value={broadcastMessage} 
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px 14px', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #D4AF37 0%, #B4932F 100%)', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)' }}
                    >
                      <Sparkles size={18} /> Bildirişi Çatdır
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ── ANALYTICS TAB ── */}
            {activeTab === 'Analitika' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2>Platforma Satış və Analitika</h2>
                </div>

                <div className={styles.analyticsGrid}>
                  {/* Left Column: Stores List and Revenues */}
                  <div className={styles.analyticsBox}>
                    <h3>Mağazaların Satış Performansı</h3>
                    <div className={styles.storesRevenuesList}>
                      <div className={styles.listHeader}>
                        <span>Mağaza</span>
                        <span>Məhsul Sayı</span>
                        <span>Ümumi Satış</span>
                      </div>
                      {vendors.map(v => {
                        const storeProdCount = products.filter(p => p.storeId === v.storeId).length;
                        const storeRev = getRevenueByStore(v.storeId);
                        return (
                          <div key={v.storeId} className={styles.storeRevRow}>
                            <strong>{v.storeName}</strong>
                            <span>{storeProdCount} ədəd</span>
                            <strong className={styles.priceCell}>{storeRev} AZN</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Platform overview */}
                  <div className={styles.analyticsBox}>
                    <h3>Sistem Performans Göstəriciləri</h3>
                    <div className={styles.systemStatsList}>
                      <div className={styles.systemStatItem}>
                        <span>Aktiv Mağazalar</span>
                        <strong>{vendors.filter(v => v.status === 'approved').length} ədəd</strong>
                      </div>
                      <div className={styles.systemStatItem}>
                        <span>Təsdiq Gözləyən</span>
                        <strong>{vendors.filter(v => v.status === 'pending').length} ədəd</strong>
                      </div>
                      <div className={styles.systemStatItem}>
                        <span>Dondurulmuş Hesablar</span>
                        <strong>{users.filter(u => u.status === 'suspended').length} ədəd</strong>
                      </div>
                      <div className={styles.systemStatItem}>
                        <span>Ümumi Satış Sayı</span>
                        <strong>{orders.length} ədəd</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
