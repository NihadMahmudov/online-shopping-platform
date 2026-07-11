import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle, Trash2,
  LogOut, Store, TrendingUp, ShoppingBag, Eye, ImagePlus,
  ShoppingCart, Zap, Calendar, CheckCircle, Camera,
  Phone, MapPin, User, Users, Clock, MessageSquare, Check, Truck,
  ChevronDown, ChevronUp, Mail, Search, Tag, Menu, X, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useStore } from '../../context/StoreContext';
import styles from './StoreDashboard.module.css';

const TABS = ['Məhsullarım', 'Məhsul Əlavə Et', 'Sifarişlər', 'Analitika', 'Rəylər', 'Kateqoriya & Flaş', 'Mağaza Parametrləri'];

const StoreDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    products, addProduct, deleteProduct, 
    categories, addCategory, deleteCategory, updateCategoryImage,
    badges, addBadge, deleteBadge,
    collections, addCollection, deleteCollection,
    flashSale, updateFlashSale,
    deleteComment
  } = useProducts();
  
  const { orders, updateOrderStatus, getOrdersByStore, getRevenueByStore } = useOrders();
  const { storeProfiles, updateStoreProfile, getStoreProfile } = useStore();

  const [activeTab, setActiveTab] = useState('Məhsullarım');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', price: '', oldPrice: '', category: 'decor',
    img: '', description: '', badge: '', collections: []
  });
  
  const [success, setSuccess] = useState(false);

  // Settings States
  const [settingsForm, setSettingsForm] = useState({
    storeName: '',
    description: '',
    banner: '',
    logo: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (user?.storeId) {
      const prof = getStoreProfile(user.storeId);
      setSettingsForm({
        storeName: prof.storeName || user.storeName || '',
        description: prof.description || '',
        banner: prof.banner || '',
        logo: prof.logo || '',
        phone: prof.phone || '',
        email: prof.email || user.email || '',
        address: prof.address || ''
      });
    }
  }, [user, storeProfiles]);

  const handleSettingsChange = e => setSettingsForm({ ...settingsForm, [e.target.name]: e.target.value });

  const handleSettingsFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsForm(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    updateStoreProfile(user.storeId, settingsForm);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  // Campaigns & Categories States
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCollLabel, setNewCollLabel] = useState('');
  const [flashTarget, setFlashTarget] = useState(
    flashSale?.targetDate ? new Date(flashSale.targetDate).toISOString().substring(0, 16) : ''
  );

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatLabel) return;
    addCategory(newCatLabel);
    setNewCatLabel('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  const handleAddCollectionSubmit = (e) => {
    e.preventDefault();
    if (!newCollLabel) return;
    addCollection(newCollLabel);
    setNewCollLabel('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  const handleFlashProductToggle = (productId) => {
    const currentIds = flashSale.productIds || [];
    const updatedIds = currentIds.includes(productId)
      ? currentIds.filter(id => id !== productId)
      : [...currentIds, productId];
    updateFlashSale({ productIds: updatedIds });
  };

  const handleSaveFlashTime = (e) => {
    e.preventDefault();
    if (!flashTarget) return;
    updateFlashSale({ targetDate: new Date(flashTarget).toISOString() });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1500);
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'Məhsullarım': return <Package size={18} />;
      case 'Məhsul Əlavə Et': return <PlusCircle size={18} />;
      case 'Sifarişlər': return <ShoppingBag size={18} />;
      case 'Analitika': return <TrendingUp size={18} />;
      case 'Rəylər': return <MessageSquare size={18} />;
      case 'Kateqoriya & Flaş': return <Tag size={18} />;
      case 'Mağaza Parametrləri': return <Settings size={18} />;
      default: return <Package size={18} />;
    }
  };

  // Redirect if not logged in or not a vendor
  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      navigate('/store-login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'vendor') {
    return null;
  }

  // Filter products by this store
  const storeProducts = products.filter(p => p.storeId === user.storeId);
  // Filter orders by this store
  const storeOrders = getOrdersByStore(user.storeId);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCollectionChange = (id) => {
    setForm(prev => ({
      ...prev,
      collections: prev.collections.includes(id)
        ? prev.collections.filter(c => c !== id)
        : [...prev.collections, id]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.price || !form.img) return;
    addProduct({
      name: form.name,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      category: form.category,
      img: form.img,
      description: form.description,
      badge: form.badge,
      collections: form.collections
    }, user.storeId, user.storeName);
    
    setForm({ name: '', price: '', oldPrice: '', category: 'decor', img: '', description: '', badge: '', collections: [] });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setActiveTab('Məhsullarım'); }, 1500);
  };

  // Filter reviews of products belonging to this vendor
  const storeProductIds = new Set(storeProducts.map(p => p.id));
  const storeReviews = products
    .filter(p => p.storeId === user.storeId)
    .flatMap(p => (p.comments || []).map(c => ({ ...c, product: p })))
    .sort((a, b) => b.id - a.id);

  // Status screens
  if (user.status === 'pending') {
    return (
      <div className={styles.statusPage}>
        <div className={styles.statusBox}>
          <div className={styles.statusIconPending}>
            <Clock size={40} />
          </div>
          <h1>Gözləmədə</h1>
          <p>Hörmətli <strong>{user.storeName}</strong>, mağazanız hazırda təsdiq mərhələsindədir. Admin icazəsi verildikdən sonra məhsul əlavə edib sata bilərsiniz.</p>
          <div className={styles.statusActions}>
            <button className={styles.logoutBtnInline} onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={16} /> Çıxış Et
            </button>
            <button className={styles.homeBtnInline} onClick={() => navigate('/')}>
              Ana Səhifəyə Get
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user.status === 'suspended') {
    return (
      <div className={styles.statusPage}>
        <div className={styles.statusBox}>
          <div className={styles.statusIconSuspended}>
            <X size={40} />
          </div>
          <h1>Hesabınız Dondurulub</h1>
          <p>Hörmətli <strong>{user.storeName}</strong>, mağazanız AtlasMall tərəfindən müvəqqəti dondurulmuşdur. Ətraflı məlumat üçün admin@atlasmall.com ilə əlaqə saxlayın.</p>
          <div className={styles.statusActions}>
            <button className={styles.logoutBtnInline} onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={16} /> Çıxış Et
            </button>
            <button className={styles.homeBtnInline} onClick={() => navigate('/')}>
              Ana Səhifəyə Get
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalViews = storeProducts.reduce((acc, p) => acc + (p.reviews || 0), 0) * 12;
  const storeRevenue = getRevenueByStore(user.storeId);

  const stats = [
    { label: 'Məhsullarım', value: storeProducts.length, icon: <Package size={22} />, color: '#D4AF37' },
    { label: 'Ümumi Baxış', value: totalViews.toLocaleString(), icon: <Eye size={22} />, color: '#2A9D8F' },
    { label: 'Sifarişlər', value: storeOrders.length, icon: <ShoppingBag size={22} />, color: '#E63946' },
    { label: 'Gəlir (₼)', value: `${storeRevenue} AZN`, icon: <TrendingUp size={22} />, color: '#4361ee' },
  ];

  return (
    <div className={styles.page}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button className={styles.menuToggle} onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <div className={styles.sidebarLogo}>Atlas<span>Mall</span></div>
        <div className={styles.mobileAvatar}>
          {user.storeName?.charAt(0).toUpperCase()}
        </div>
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
                <div className={styles.storeAvatar}>
                  {user.storeName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={styles.storeName}>{user.storeName}</p>
                  <p className={styles.storeEmail}>{user.email}</p>
                  <span className="badge-approved">Mağaza</span>
                </div>
              </div>

              <nav className={styles.sideNav}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    className={`${styles.navItem} ${activeTab === tab ? styles.navActive : ''}`}
                    onClick={() => {
                      setActiveTab(tab);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {getTabIcon(tab)}
                    {tab}
                  </button>
                ))}
                <button className={styles.navItem} onClick={() => navigate('/')}>
                  <Store size={18} /> Sayta Keç
                </button>
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
        <div className={styles.sidebarLogo}>Atlas<span>Mall</span></div>

        <div className={styles.storeInfo}>
          <div className={styles.storeAvatar}>
            {user.storeName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={styles.storeName}>{user.storeName}</p>
            <p className={styles.storeEmail}>{user.email}</p>
            <span className="badge-approved">Mağaza</span>
          </div>
        </div>

        <nav className={styles.sideNav}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.navItem} ${activeTab === tab ? styles.navActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {getTabIcon(tab)}
              {tab}
            </button>
          ))}
          <button className={styles.navItem} onClick={() => navigate('/')}>
            <Store size={18} /> Sayta Keç
          </button>
        </nav>

        <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={18} /> Çıxış
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <div>
            <h1>Xoş gəldiniz, {user.storeName}! 👋</h1>
            <p>Mağaza panelinizdən məhsullarınızı və sifarişlərinizi idarə edin.</p>
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

        {/* Tab Content */}
        <div className={styles.tabContent}>
          <AnimatePresence mode="wait">
            {activeTab === 'Məhsullarım' ? (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2>Bütün Məhsullar ({storeProducts.length})</h2>
                  <button className={styles.addBtn} onClick={() => setActiveTab('Məhsul Əlavə Et')}>
                    <PlusCircle size={16} /> Yeni Məhsul
                  </button>
                </div>

                <div className={styles.tableCard}>
                  <div className={styles.table}>
                    <div className={styles.tableHeader}>
                      <span>Məhsul</span>
                      <span>Kateqoriya</span>
                      <span>Qiymət</span>
                      <span>Reytinq</span>
                      <span>Əməliyyat</span>
                    </div>
                    {storeProducts.length === 0 ? (
                      <div className={styles.noData}>Məhsul tapılmadı. Yeni məhsul əlavə edin.</div>
                    ) : (
                      storeProducts.map(p => (
                        <div key={p.id} className={styles.tableRow}>
                          <div className={styles.productCell}>
                            <img src={p.img} alt={p.name} onError={e => { e.target.src = 'https://placehold.co/48x48/f5f0e8/D4AF37?text=B'; }} />
                            <span>{p.name}</span>
                          </div>
                          <span className={styles.catTag}>{categories.find(c => c.id === p.category)?.label || p.category}</span>
                          <span className={styles.priceCell}>{p.price} AZN</span>
                          <span>⭐ {p.rating || 5.0}</span>
                          <button className={styles.deleteBtn} onClick={() => deleteProduct(p.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'Məhsul Əlavə Et' ? (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={styles.addForm}
              >
                <h2>Yeni Məhsul Əlavə Et</h2>
                <p>Əlavə etdiyiniz məhsul təsdiq edildikdən sonra mağazada görünəcək.</p>

                {success && (
                  <div className={styles.successMsg}>
                    ✅ Məhsul uğurla əlavə edildi!
                  </div>
                )}

                <form onSubmit={handleSubmit} className={styles.premiumForm}>
                  {/* Left Column: Main Info */}
                  <div className={styles.formColumn}>
                    <div className={styles.formSectionBox}>
                      <h3 className={styles.boxTitle}>Əsas Məlumatlar</h3>
                      
                      <div className={styles.formGroup}>
                        <label>Məhsul Adı *</label>
                        <div className={styles.inputWrapper}>
                          <Package size={18} className={styles.inputIcon} />
                          <input name="name" value={form.name} onChange={handleChange} placeholder="məs. Zərif Gümüş Sırğalar" required />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Məhsulun Təsviri</label>
                        <textarea 
                          name="description" 
                          value={form.description} 
                          onChange={handleChange} 
                          placeholder="Məhsul haqqında ətraflı məlumat..." 
                          rows="4"
                          className={styles.premiumTextarea}
                        />
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Qiymət (AZN) *</label>
                          <div className={styles.inputWrapper}>
                            <span className={styles.currencySymbol}>₼</span>
                            <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" required />
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <label>Köhnə Qiymət (AZN)</label>
                          <div className={styles.inputWrapper}>
                            <span className={styles.currencySymbol}>₼</span>
                            <input name="oldPrice" type="number" value={form.oldPrice} onChange={handleChange} placeholder="0.00" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formSectionBox}>
                      <h3 className={styles.boxTitle}>Kolleksiyalar</h3>
                      <div className={styles.pillsGrid}>
                        {collections.map(opt => {
                          const isChecked = form.collections.includes(opt.id);
                          return (
                            <button 
                              type="button"
                              key={opt.id} 
                              className={`${styles.collectionPill} ${isChecked ? styles.pillActive : ''}`}
                              onClick={() => handleCollectionChange(opt.id)}
                            >
                              {isChecked ? <CheckCircle size={16} /> : <PlusCircle size={16} />}
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Meta Info & Media */}
                  <div className={styles.formColumn}>
                    <div className={styles.formSectionBox}>
                      <h3 className={styles.boxTitle}>Kateqoriya və Etiket</h3>
                      <div className={styles.formGroup}>
                        <label>Kateqoriya *</label>
                        <div className={styles.inputWrapper}>
                          <LayoutDashboard size={18} className={styles.inputIcon} />
                          <select name="category" value={form.category} onChange={handleChange}>
                            {categories.filter(c => c.id !== 'all').map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Etiket (Badge)</label>
                        <div className={styles.inputWrapper}>
                          <Tag size={18} className={styles.inputIcon} />
                          <select name="badge" value={form.badge} onChange={handleChange}>
                            <option value="">Heç biri</option>
                            {badges.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formSectionBox}>
                      <h3 className={styles.boxTitle}>Məhsul Şəkli *</h3>
                      <div className={styles.imageUploadBox}>
                        <input type="file" accept="image/*" onChange={handleImageUpload} required={!form.img} />
                        {form.img ? (
                          <div className={styles.imgPreviewContainer}>
                            <img src={form.img} alt="preview" className={styles.imgPreviewFull} />
                            <div className={styles.changeImgOverlay}>
                              <Camera size={24} />
                              <span>Şəkli Dəyişdir</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={styles.uploadIconWrapper}>
                              <ImagePlus size={32} />
                            </div>
                            <div className={styles.uploadText}>Şəkil yükləmək üçün klikləyin</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    <PlusCircle size={20} /> Məhsul Əlavə Et
                  </button>
                </form>
              </motion.div>
            ) : activeTab === 'Sifarişlər' ? (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2>Mağaza Sifarişləri ({storeOrders.length})</h2>
                  <p>Müştərilərin sizin mağazanızdan etdiyi sifarişlər.</p>
                </div>

                <div className={styles.tableCard}>
                  <div className={styles.table}>
                    <div className={styles.tableHeader}>
                      <span>Sifariş İD</span>
                      <span>Müştəri</span>
                      <span>Ümumi Məbləğ</span>
                      <span>Tarix</span>
                      <span>Status</span>
                      <span>Əməliyyat</span>
                    </div>
                    {storeOrders.length === 0 ? (
                      <div className={styles.noData}>Mağazanıza aid sifariş tapılmadı.</div>
                    ) : (
                      storeOrders.map(o => (
                        <div key={o.id} className={styles.tableRow}>
                          <span className={styles.orderId}>{o.id}</span>
                          <div className={styles.customerCell}>
                            <strong>{o.customerName}</strong>
                            <span>{o.email}</span>
                          </div>
                          <span className={styles.priceCell}>{o.total} AZN</span>
                          <span>{new Date(o.createdAt).toLocaleDateString('az-AZ')}</span>
                          <span>
                            <span className={
                              o.status === 'delivered' ? 'badge-approved' : 
                              o.status === 'pending' ? 'badge-pending' : 
                              'badge-rejected'
                            }>
                              {o.status === 'pending' ? 'Gözləmədə' : 
                               o.status === 'approved' ? 'Təsdiqləndi' : 
                               o.status === 'shipped' ? 'Yoldadır' : 
                               o.status === 'delivered' ? 'Çatdırıldı' : 'Ləğv edilib'}
                            </span>
                          </span>
                          <div className={styles.actionCell}>
                            <select 
                              value={o.status} 
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className={styles.statusSelect}
                            >
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
              </motion.div>
            ) : activeTab === 'Analitika' ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2>Mağaza Analitikası</h2>
                <p>Mağazanızın performansı haqqında əsas göstəricilər.</p>

                <div className={styles.analyticsRow}>
                  <div className={styles.analyticBox}>
                    <h3>Ümumi Satış Performansı</h3>
                    <div className={styles.analyticStat}>
                      <span>Aylıq Satış Gəliri</span>
                      <h2>{storeRevenue} AZN</h2>
                    </div>
                    <div className={styles.analyticProgressBar}>
                      <div className={styles.progressFill} style={{ width: '75%' }}></div>
                    </div>
                    <p className={styles.analyticHelp}>Mağazanızın cari aylıq hədəfinin 75%-i yerinə yetirilib.</p>
                  </div>

                  <div className={styles.analyticBox}>
                    <h3>Məhsul Paylanması</h3>
                    <div className={styles.listSimple}>
                      {categories.filter(c => c.id !== 'all').map(c => {
                        const count = storeProducts.filter(p => p.category === c.id).length;
                        return (
                          <div key={c.id} className={styles.listSimpleItem}>
                            <span>{c.label}</span>
                            <strong>{count} ədəd</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'Rəylər' ? (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2>Müştəri Rəyləri</h2>
                  <p>Məhsullarınıza yazılan son şərhlər.</p>
                </div>

                <div className={styles.reviewsList}>
                  {storeReviews.length === 0 ? (
                    <div className={styles.noData}>Hələ heç bir məhsulunuza rəy yazılmayıb.</div>
                  ) : (
                    storeReviews.map(r => (
                      <div key={r.id} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewerAvatar}>
                            {r.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4>{r.name}</h4>
                            <span className={styles.reviewDate}>{r.date}</span>
                          </div>
                          <div className={styles.reviewProduct}>
                            <span>Məhsul: </span><strong>{r.product?.name}</strong>
                          </div>
                        </div>
                        <div className={styles.reviewRating}>
                          {'⭐'.repeat(r.rating)}
                        </div>
                        <p className={styles.reviewText}>{r.text}</p>
                        <button className={styles.deleteReviewBtn} onClick={() => deleteComment(r.product.id, r.id)}>
                          Rəyi Sil
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'Kateqoriya & Flaş' ? (
              <motion.div
                key="campaigns"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2>Platforma Ayarları & Kampaniyalar</h2>
                <p>Kateqoriyaları və flaş satış kampaniyalarını idarə edin.</p>

                {success && (
                  <div className={styles.successMsg} style={{ background: 'rgba(42, 157, 143, 0.15)', color: '#2a9d8f', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    ✅ Əməliyyat uğurla yerinə yetirildi!
                  </div>
                )}

                <div className={styles.campaignsGrid}>
                  {/* Left Column: Categories and Collections */}
                  <div>
                    <div className={styles.settingsBox}>
                      <h3>Kateqoriyalar</h3>
                      <form onSubmit={handleAddCategorySubmit} className={styles.campaignsForm}>
                        <input 
                          type="text" 
                          value={newCatLabel} 
                          onChange={(e) => setNewCatLabel(e.target.value)} 
                          placeholder="Yeni kateqoriya adı..." 
                          className={styles.settingsInput}
                          required
                        />
                        <button type="submit" className={styles.settingsSubmitBtn} style={{ width: 'auto', padding: '0 20px' }}>Əlavə Et</button>
                      </form>
                      <div className={styles.campaignsList}>
                        {categories.filter(c => c.id !== 'all').map(c => (
                          <div key={c.id} className={styles.campaignsListItem}>
                            <span>{c.label} ({products.filter(p => p.category === c.id).length} məhsul)</span>
                            <button type="button" onClick={() => deleteCategory(c.id)} className={styles.deleteItemBtn}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.settingsBox}>
                      <h3>Kolleksiyalar (Etiketlər)</h3>
                      <form onSubmit={handleAddCollectionSubmit} className={styles.campaignsForm}>
                        <input 
                          type="text" 
                          value={newCollLabel} 
                          onChange={(e) => setNewCollLabel(e.target.value)} 
                          placeholder="Yeni kolleksiya adı..." 
                          className={styles.settingsInput}
                          required
                        />
                        <button type="submit" className={styles.settingsSubmitBtn} style={{ width: 'auto', padding: '0 20px' }}>Əlavə Et</button>
                      </form>
                      <div className={styles.campaignsList}>
                        {collections.map(coll => (
                          <div key={coll.id} className={styles.campaignsListItem}>
                            <span>{coll.label}</span>
                            <button type="button" onClick={() => deleteCollection(coll.id)} className={styles.deleteItemBtn}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Flash Sale Manager */}
                  <div>
                    <div className={styles.settingsBox}>
                      <h3>Flaş Satış Kampaniyası</h3>
                      <p style={{ fontSize: '0.85rem', color: '#a0a0a0', marginBottom: '16px' }}>Kampaniyanın bitmə vaxtını təyin edin və məhsulları seçin.</p>
                      
                      <form onSubmit={handleSaveFlashTime} className={styles.campaignsForm} style={{ flexDirection: 'column', gap: '8px' }}>
                        <div className={styles.settingsFormGroup} style={{ width: '100%', marginBottom: 0 }}>
                          <label>Bitmə Vaxtı</label>
                          <input 
                            type="datetime-local" 
                            value={flashTarget} 
                            onChange={(e) => setFlashTarget(e.target.value)} 
                            className={styles.settingsInput}
                            required
                          />
                        </div>
                        <button type="submit" className={styles.settingsSubmitBtn} style={{ marginTop: '8px' }}>Vaxtı Yadda Saxla</button>
                      </form>

                      <h4 style={{ fontSize: '0.9rem', color: '#fff', marginTop: '24px', marginBottom: '8px' }}>Kampaniyaya Məhsul Əlavə Et</h4>
                      <div className={styles.flashProductsList}>
                        {storeProducts.length === 0 ? (
                          <div style={{ fontSize: '0.85rem', color: '#a0a0a0', textAlign: 'center', padding: '16px' }}>Məhsul tapılmadı.</div>
                        ) : (
                          storeProducts.map(p => {
                            const isInFlash = (flashSale?.productIds || []).includes(p.id);
                            return (
                              <div key={p.id} className={styles.flashProductItem}>
                                <input 
                                  type="checkbox" 
                                  checked={isInFlash} 
                                  onChange={() => handleFlashProductToggle(p.id)}
                                />
                                <img src={p.img} alt={p.name} />
                                <div className={styles.flashProductItemInfo}>
                                  <h4>{p.name}</h4>
                                  <span>{p.price} AZN</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2>Mağaza Parametrləri</h2>
                <p>Mağazanızın profil məlumatlarını, banner və loqosunu tənzimləyin.</p>

                {success && (
                  <div className={styles.successMsg} style={{ background: 'rgba(42, 157, 143, 0.15)', color: '#2a9d8f', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    ✅ Parametrlər uğurla yeniləndi!
                  </div>
                )}

                <form onSubmit={handleSettingsSubmit} className={styles.settingsGrid}>
                  {/* Left Box: Basic Info */}
                  <div className={styles.settingsBox}>
                    <h3>Profil Məlumatları</h3>
                    
                    <div className={styles.settingsFormGroup}>
                      <label>Mağaza Adı</label>
                      <input 
                        type="text" 
                        name="storeName" 
                        value={settingsForm.storeName} 
                        onChange={handleSettingsChange} 
                        className={styles.settingsInput}
                        required
                      />
                    </div>

                    <div className={styles.settingsFormGroup}>
                      <label>Təsvir (Mağaza haqqında)</label>
                      <textarea 
                        name="description" 
                        value={settingsForm.description} 
                        onChange={handleSettingsChange} 
                        className={styles.settingsTextarea}
                        placeholder="Mağazanız haqqında ətraflı məlumat..."
                        rows="5"
                      />
                    </div>

                    <div className={styles.settingsFormGroup}>
                      <label>Telefon</label>
                      <input 
                        type="text" 
                        name="phone" 
                        value={settingsForm.phone} 
                        onChange={handleSettingsChange} 
                        className={styles.settingsInput}
                        placeholder="+994 50 123 45 67"
                      />
                    </div>

                    <div className={styles.settingsFormGroup}>
                      <label>E-poçt ünvanı</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={settingsForm.email} 
                        onChange={handleSettingsChange} 
                        className={styles.settingsInput}
                        required
                      />
                    </div>

                    <div className={styles.settingsFormGroup}>
                      <label>Ünvan</label>
                      <input 
                        type="text" 
                        name="address" 
                        value={settingsForm.address} 
                        onChange={handleSettingsChange} 
                        className={styles.settingsInput}
                        placeholder="Bakı, Nizami küç. 45"
                      />
                    </div>

                    <button type="submit" className={styles.settingsSubmitBtn} style={{ marginTop: '8px' }}>Yadda Saxla</button>
                  </div>

                  {/* Right Box: Banner & Logo Upload */}
                  <div className={styles.settingsBox}>
                    <h3>Görünüş & Media</h3>
                    
                    <div className={styles.uploadPreviewRow}>
                      <div className={styles.settingsFormGroup}>
                        <label>Mağaza Banner Şəkli</label>
                        <div className={styles.imageUploadCard}>
                          <input type="file" accept="image/*" onChange={(e) => handleSettingsFileChange(e, 'banner')} />
                          <span>Şəkil Yükləmək Üçün Klikləyin</span>
                        </div>
                        {settingsForm.banner ? (
                          <img src={settingsForm.banner} alt="Banner" className={styles.bannerPreview} />
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#a0a0a0', marginTop: '6px' }}>Hələ banner şəkli təyin edilməyib.</div>
                        )}
                      </div>

                      <div className={styles.settingsFormGroup} style={{ marginTop: '16px' }}>
                        <label>Mağaza Logosu</label>
                        <div className={styles.imageUploadCard}>
                          <input type="file" accept="image/*" onChange={(e) => handleSettingsFileChange(e, 'logo')} />
                          <span>Loqo Yükləmək Üçün Klikləyin</span>
                        </div>
                        {settingsForm.logo ? (
                          <img src={settingsForm.logo} alt="Logo" className={styles.logoPreview} />
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#a0a0a0', marginTop: '6px', textAlign: 'center' }}>Hələ loqo təyin edilməyib.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default StoreDashboard;
