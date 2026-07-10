import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle, Trash2,
  LogOut, Store, TrendingUp, ShoppingBag, Eye, ImagePlus,
  ShoppingCart, Zap, Calendar, CheckCircle, Camera,
  Phone, MapPin, User, Users, Clock, MessageSquare, Check, Truck,
  ChevronDown, ChevronUp, Mail, Search, Tag, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import styles from './Dashboard.module.css';

const TABS = ['Məhsullarım', 'Məhsul Əlavə Et', 'Kateqoriyalar', 'Sifarişlər', 'Analitika', 'Flaş Satış', 'Rəylər', 'Müştərilər'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, users, logout, deleteUser } = useAuth();
  const { 
    products, addProduct, deleteProduct, 
    categories, addCategory, deleteCategory, updateCategoryImage,
    badges, addBadge, deleteBadge,
    collections, addCollection, deleteCollection,
    flashSale, updateFlashSale,
    deleteComment
  } = useProducts();
  const { orders, updateOrderStatus } = useOrders();
  const [activeTab, setActiveTab] = useState('Məhsullarım');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', price: '', oldPrice: '', category: 'decor',
    img: '', description: '', badge: '', collections: []
  });
  const [newCat, setNewCat] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newColl, setNewColl] = useState('');
  const [success, setSuccess] = useState(false);

  // States for order management
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderFilter, setSelectedOrderFilter] = useState('all');

  const toggleOrderExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getOrderStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Gözləmədə', color: '#ef6c00', icon: <Clock size={14} /> };
      case 'approved':
        return { label: 'Təsdiqləndi', color: '#1976d2', icon: <CheckCircle size={14} /> };
      case 'shipped':
        return { label: 'Yoldadır', color: '#7b1fa2', icon: <Truck size={14} /> };
      case 'delivered':
        return { label: 'Çatdırıldı', color: '#2e7d32', icon: <CheckCircle size={14} /> };
      default:
        return { label: 'Gözləmədə', color: '#ef6c00', icon: <Clock size={14} /> };
    }
  };

  // Filter and search orders
  const filteredOrders = orders.filter(o => {
    if (selectedOrderFilter !== 'all' && o.status !== selectedOrderFilter) {
      return false;
    }
    if (orderSearchQuery) {
      const q = orderSearchQuery.toLowerCase();
      const nameMatch = o.customerName?.toLowerCase().includes(q);
      const idMatch = o.id?.toLowerCase().includes(q);
      const phoneMatch = o.phone?.toLowerCase().includes(q);
      return nameMatch || idMatch || phoneMatch;
    }
    return true;
  });

  // Redirect if not logged in or not admin
  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

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
    });
    setForm({ name: '', price: '', oldPrice: '', category: 'decor', img: '', description: '', badge: '', collections: [] });
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setActiveTab('Məhsullarım'); }, 1500);
  };

  const totalViews = products.reduce((acc, p) => acc + (p.reviews || 0), 0) * 12;
  const trend = products.length > 0 ? `+${Math.round((orders.length / products.length) * 100)}%` : '0%';

  const stats = [
    { label: 'Məhsullarım', value: products.length, icon: <Package size={22} />, color: '#D4AF37' },
    { label: 'Ümumi Baxış', value: totalViews.toLocaleString(), icon: <Eye size={22} />, color: '#2A9D8F' },
    { label: 'Sifarişlər', value: orders.length, icon: <ShoppingBag size={22} />, color: '#E63946' },
    { label: 'Trend', value: trend, icon: <TrendingUp size={22} />, color: '#4361ee' },
  ];

  return (
    <div className={styles.page}>
      {/* Mobile Top Bar */}
      <header className={styles.mobileHeader}>
        <button className={styles.menuToggle} onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
        <div className={styles.sidebarLogo}>BAME<span>.</span></div>
        <div className={styles.mobileAvatar} onClick={() => setIsMobileMenuOpen(true)}>
          {user.name?.charAt(0).toUpperCase()}
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
                <div className={styles.sidebarLogo}>BAME<span>.</span></div>
                <button className={styles.closeBtn} onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.storeInfo}>
                <div className={styles.storeAvatar}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={styles.storeName}>{user.storeName}</p>
                  <p className={styles.storeEmail}>{user.email}</p>
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
                    {tab === 'Məhsullarım' ? <Package size={18} /> : 
                     tab === 'Sifarişlər' ? <ShoppingBag size={18} /> : 
                     tab === 'Kateqoriyalar' ? <LayoutDashboard size={18} /> :
                     tab === 'Analitika' ? <TrendingUp size={18} /> : 
                     tab === 'Flaş Satış' ? <Zap size={18} /> : 
                     tab === 'Rəylər' ? <MessageSquare size={18} /> : 
                     tab === 'Müştərilər' ? <Users size={18} /> : 
                     <PlusCircle size={18} />}
                    {tab}
                  </button>
                ))}
                <button 
                  className={styles.navItem} 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/shop');
                  }}
                >
                  <Store size={18} /> Mağazaya Bax
                </button>
              </nav>

              <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
                <LogOut size={18} /> Çıxış
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (hidden on mobile via CSS) */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>BAME<span>.</span></div>

        <div className={styles.storeInfo}>
          <div className={styles.storeAvatar}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={styles.storeName}>{user.storeName}</p>
            <p className={styles.storeEmail}>{user.email}</p>
          </div>
        </div>

        <nav className={styles.sideNav}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.navItem} ${activeTab === tab ? styles.navActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Məhsullarım' ? <Package size={18} /> : 
               tab === 'Sifarişlər' ? <ShoppingBag size={18} /> : 
               tab === 'Kateqoriyalar' ? <LayoutDashboard size={18} /> :
               tab === 'Analitika' ? <TrendingUp size={18} /> : 
               tab === 'Flaş Satış' ? <Zap size={18} /> : 
               tab === 'Rəylər' ? <MessageSquare size={18} /> : 
               tab === 'Müştərilər' ? <Users size={18} /> : 
               <PlusCircle size={18} />}
              {tab}
            </button>
          ))}
          <button className={styles.navItem} onClick={() => navigate('/shop')}>
            <Store size={18} /> Mağazaya Bax
          </button>
        </nav>

        <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={18} /> Çıxış
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.mainHeader}>
          <div>
            <h1>Xoş gəldiniz, {user.name}! 👋</h1>
            <p>Mağazanızı idarə edin və məhsullarınızı əlavə edin.</p>
          </div>
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
                  <h2>Bütün Məhsullar ({products.length})</h2>
                  <button className={styles.addBtn} onClick={() => setActiveTab('Məhsul Əlavə Et')}>
                    <PlusCircle size={16} /> Yeni Məhsul
                  </button>
                </div>
                <div className={styles.table}>
                  <div className={styles.tableHeader}>
                    <span>Məhsul</span>
                    <span>Kateqoriya</span>
                    <span>Qiymət</span>
                    <span>Reytinq</span>
                    <span>Əməliyyat</span>
                  </div>
                  {products.map(p => (
                    <div key={p.id} className={styles.tableRow}>
                      <div className={styles.productCell}>
                        <img src={p.img} alt={p.name} onError={e => { e.target.src = 'https://placehold.co/48x48/f5f0e8/D4AF37?text=B'; }} />
                        <span>{p.name}</span>
                      </div>
                      <span className={styles.catTag}>{categories.find(c => c.id === p.category)?.label}</span>
                      <span className={styles.priceCell}>{p.price} AZN</span>
                      <span>⭐ {p.rating}</span>
                      <button className={styles.deleteBtn} onClick={() => deleteProduct(p.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
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
                <p>Əlavə etdiyiniz məhsul dərhal mağazada görünəcək.</p>

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
                          <input name="name" value={form.name} onChange={handleChange} placeholder="məs. Qızılı Boyunbağı" required />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Məhsulun Təsviri</label>
                        <textarea 
                          name="description" 
                          value={form.description} 
                          onChange={handleChange} 
                          placeholder="Məhsul haqqında geniş və cəlbedici məlumat yazın..." 
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
                      <h3 className={styles.boxTitle}>Kolleksiya və Bölmələr</h3>
                      <p className={styles.boxSubTitle}>Məhsulun hansı xüsusi səhifələrdə görünəcəyini seçin.</p>
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
                      <h3 className={styles.boxTitle}>Kateqoriya & Etiket</h3>
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
                        <label>Özəl Etiket (Badge)</label>
                        <div className={styles.inputWrapper}>
                          <Tag size={18} className={styles.inputIcon} />
                          <select name="badge" value={form.badge} onChange={handleChange}>
                            <option value="">Heç biri (Seçilməyib)</option>
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
                            <div className={styles.uploadText}>Şəkil yükləmək üçün bura tıklayın</div>
                            <div className={styles.uploadSub}>və ya faylı sürükləyin (PNG, JPG)</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    <PlusCircle size={20} /> Yeni Məhsulu Mağazaya Əlavə Et
                  </button>
                </form>
              </motion.div>
            ) : activeTab === 'Kateqoriyalar' ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2>Kateqoriya və Etiket İdarəedilməsi</h2>
                  <p>Yeni kateqoriya və ya etiket (badge) əlavə edin.</p>
                </div>

                <div className={styles.managementGrid}>
                  {/* Category Management */}
                  <div className={styles.manageBox}>
                    <h3>Kateqoriya Əlavə Et</h3>
                    <div className={styles.manageAction}>
                      <input 
                        value={newCat} 
                        onChange={e => setNewCat(e.target.value)} 
                        placeholder="məs. Texnologiya" 
                      />
                      <button onClick={() => { if(newCat){ addCategory(newCat); setNewCat(''); } }}>
                        <PlusCircle size={18} /> Əlavə Et
                      </button>
                    </div>
                  </div>

                  {/* Badge Management */}
                  <div className={styles.manageBox}>
                    <h3>Yeni Etiket Əlavə Et</h3>
                    <div className={styles.manageAction}>
                      <input 
                        value={newBadge} 
                        onChange={e => setNewBadge(e.target.value)} 
                        placeholder="məs. Məhdud Sayda" 
                      />
                      <button onClick={() => { if(newBadge){ addBadge(newBadge); setNewBadge(''); } }}>
                        <PlusCircle size={18} /> Əlavə Et
                      </button>
                    </div>
                  </div>

                  {/* Collection Management */}
                  <div className={styles.manageBox}>
                    <h3>Xüsusi Kolleksiya Əlavə Et</h3>
                    <div className={styles.manageAction}>
                      <input 
                        value={newColl} 
                        onChange={e => setNewColl(e.target.value)} 
                        placeholder="məs. Bayram Hədiyyələri" 
                      />
                      <button onClick={() => { if(newColl){ addCollection(newColl); setNewColl(''); } }}>
                        <PlusCircle size={18} /> Əlavə Et
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.badgeListSection}>
                  <div className={styles.manageRow}>
                    <div className={styles.manageHalf}>
                      <h3>Mövcud Etiketlər</h3>
                      <div className={styles.badgeTags}>
                        {badges.map(b => (
                          <span key={b} className={styles.badgeTag}>
                            {b} <button onClick={() => deleteBadge(b)}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.manageHalf}>
                      <h3>Mövcud Kolleksiyalar</h3>
                      <div className={styles.badgeTags}>
                        {collections.map(c => (
                          <span key={c.id} className={styles.badgeTag}>
                            {c.label} <button onClick={() => deleteCollection(c.id)}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.sectionHeader} style={{ marginTop: '40px' }}>
                  <h2>Kateqoriya Şəkilləri</h2>
                </div>
                <div className={styles.categoryEditorGrid}>
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <div key={cat.id} className={styles.categoryEditCard}>
                      <div className={styles.catEditImg}>
                        <img src={cat.img} alt={cat.label} onError={e => { e.target.src = 'https://placehold.co/200x150/f5f0e8/D4AF37?text=' + cat.label; }} />
                        <label className={styles.uploadOverlay}>
                          <ImagePlus size={24} />
                          <input 
                            type="file" 
                            accept="image/*" 
                            hidden 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => updateCategoryImage(cat.id, reader.result);
                                reader.readAsDataURL(file);
                              }
                            }} 
                          />
                        </label>
                      </div>
                      <div className={styles.catEditInfo}>
                        <h3>{cat.label}</h3>
                        <div className={styles.catCardFooter}>
                          <span>{products.filter(p => p.category === cat.id).length} Məhsul</span>
                          <button className={styles.catDeleteBtn} onClick={() => deleteCategory(cat.id)}>
                            <Trash2 size={14} /> Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : activeTab === 'Analitika' ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={styles.analyticsPage}
              >
                {/* Page Title */}
                <div className={styles.analyticsTitleRow}>
                  <div>
                    <h2 className={styles.analyticsTitle}>Mağaza Analitikası</h2>
                    <p className={styles.analyticsSubtitle}>Bütün məlumatlar real vaxtda yenilənir</p>
                  </div>
                  <div className={styles.analyticsBadge}>
                    <TrendingUp size={14} /> Canlı
                  </div>
                </div>

                {/* KPI Cards */}
                <div className={styles.kpiGrid}>
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className={styles.kpiCard}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <div className={styles.kpiTop}>
                        <div className={styles.kpiIcon} style={{ background: `${stat.color}18`, color: stat.color }}>
                          {stat.icon}
                        </div>
                        <span className={styles.kpiTrend} style={{ color: stat.color }}>
                          {i === 3 ? trend : `+${Math.max(1, Math.round(Math.random() * 12))}%`}
                        </span>
                      </div>
                      <p className={styles.kpiValue}>{stat.value}</p>
                      <p className={styles.kpiLabel}>{stat.label}</p>
                      <div className={styles.kpiBar}>
                        <motion.div
                          className={styles.kpiBarFill}
                          style={{ background: stat.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(85, 30 + i * 18)}%` }}
                          transition={{ delay: 0.3 + i * 0.07, duration: 0.8 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className={styles.analyticsChartsRow}>
                  {/* Category Distribution */}
                  <div className={styles.analyticsCard}>
                    <div className={styles.analyticsCardHeader}>
                      <h3>Kateqoriya Bölgüsü</h3>
                      <span className={styles.analyticsCardBadge}>{categories.filter(c => c.id !== 'all').length} kateqoriya</span>
                    </div>
                    <div className={styles.barChartPro}>
                      {categories.filter(c => c.id !== 'all').map((cat, idx) => {
                        const count = products.filter(p => p.category === cat.id).length;
                        const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
                        const colors = ['#D4AF37','#2A9D8F','#E63946','#4361ee','#f77f00','#8338ec'];
                        const color = colors[idx % colors.length];
                        return (
                          <div key={cat.id} className={styles.barItemPro}>
                            <div className={styles.barRowTop}>
                              <span className={styles.barCatLabel}>{cat.label}</span>
                              <span className={styles.barCatCount} style={{ color }}>{count} məhsul</span>
                            </div>
                            <div className={styles.barTrackPro}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.05 }}
                                className={styles.barFillPro}
                                style={{ background: color }}
                              />
                            </div>
                            <span className={styles.barPercent}>{Math.round(percentage)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Products */}
                  <div className={styles.analyticsCard}>
                    <div className={styles.analyticsCardHeader}>
                      <h3>Ən Populyar Məhsullar</h3>
                      <span className={styles.analyticsCardBadge}>TOP 5</span>
                    </div>
                    <div className={styles.topProdListPro}>
                      {[...products]
                        .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
                        .slice(0, 5)
                        .map((p, idx) => {
                          const maxRev = Math.max(...products.map(pr => pr.reviews || 0), 1);
                          const pct = ((p.reviews || 0) / maxRev) * 100;
                          return (
                            <div key={p.id} className={styles.topProdRowPro}>
                              <span className={styles.topProdRank}>#{idx + 1}</span>
                              <img
                                src={p.img}
                                alt={p.name}
                                className={styles.topProdImgPro}
                                onError={e => { e.target.src = 'https://placehold.co/40x40/f5f0e8/D4AF37?text=B'; }}
                              />
                              <div className={styles.topProdBodyPro}>
                                <div className={styles.topProdNameRow}>
                                  <span className={styles.topProdNamePro}>{p.name}</span>
                                  <span className={styles.topProdRevPro}>{p.reviews || 0} rəy</span>
                                </div>
                                <div className={styles.miniBarTrackPro}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.7, delay: idx * 0.05 }}
                                    className={styles.miniBarFillPro}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className={styles.analyticsBottomRow}>
                  {/* Order Status Breakdown */}
                  <div className={styles.analyticsCard}>
                    <div className={styles.analyticsCardHeader}>
                      <h3>Sifariş Statusları</h3>
                    </div>
                    <div className={styles.orderStatusList}>
                      {[
                        { label: 'Gözləmədə', status: 'pending', color: '#ef6c00', bg: '#fff3e0', icon: <Clock size={18} /> },
                        { label: 'Təsdiqləndi', status: 'approved', color: '#1976d2', bg: '#e3f2fd', icon: <CheckCircle size={18} /> },
                        { label: 'Yoldadır', status: 'shipped', color: '#7b1fa2', bg: '#f3e5f5', icon: <Truck size={18} /> },
                        { label: 'Çatdırıldı', status: 'delivered', color: '#2e7d32', bg: '#e8f5e9', icon: <Check size={18} /> },
                      ].map(({ label, status, color, bg, icon }) => {
                        const count = orders.filter(o => o.status === status).length;
                        const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                        return (
                          <div key={status} className={styles.orderStatusRow}>
                            <div className={styles.orderStatusIconPro} style={{ background: bg, color }}>
                              {icon}
                            </div>
                            <div className={styles.orderStatusBody}>
                              <div className={styles.orderStatusTopRow}>
                                <span className={styles.orderStatusLabelPro}>{label}</span>
                                <span className={styles.orderStatusCount} style={{ color }}>{count}</span>
                              </div>
                              <div className={styles.orderStatusTrack}>
                                <motion.div
                                  className={styles.orderStatusFill}
                                  style={{ background: color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.7 }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Revenue Summary */}
                  <div className={styles.analyticsCard}>
                    <div className={styles.analyticsCardHeader}>
                      <h3>Gəlir Xülasəsi</h3>
                    </div>
                    <div className={styles.revenueSummary}>
                      <div className={styles.revenueMainBlock}>
                        <p className={styles.revenueAmount}>
                          {orders.reduce((acc, o) => acc + (o.total || 0), 0).toFixed(2)} <span>AZN</span>
                        </p>
                        <p className={styles.revenueCaption}>Ümumi gəlir</p>
                      </div>
                      <div className={styles.revenueStats}>
                        <div className={styles.revenueStatItem}>
                          <span className={styles.revenueStatLabel}>Ortalama sifariş</span>
                          <span className={styles.revenueStatVal}>
                            {orders.length > 0
                              ? (orders.reduce((acc, o) => acc + (o.total || 0), 0) / orders.length).toFixed(2)
                              : '0.00'} AZN
                          </span>
                        </div>
                        <div className={styles.revenueStatItem}>
                          <span className={styles.revenueStatLabel}>Ən baha məhsul</span>
                          <span className={styles.revenueStatVal}>
                            {products.length > 0
                              ? Math.max(...products.map(p => p.price || 0)).toFixed(2)
                              : '0.00'} AZN
                          </span>
                        </div>
                        <div className={styles.revenueStatItem}>
                          <span className={styles.revenueStatLabel}>Ən ucuz məhsul</span>
                          <span className={styles.revenueStatVal}>
                            {products.length > 0
                              ? Math.min(...products.map(p => p.price || 0)).toFixed(2)
                              : '0.00'} AZN
                          </span>
                        </div>
                        <div className={styles.revenueStatItem}>
                          <span className={styles.revenueStatLabel}>Aktiv müştərilər</span>
                          <span className={styles.revenueStatVal}>{users?.length || 0} nəfər</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

            ) : activeTab === 'Flaş Satış' ? (
              <motion.div
                key="flash_sale"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={styles.flashSaleContainer}
              >
                <div className={styles.flashHeaderPro}>
                  <div className={styles.flashHeaderLeft}>
                    <div className={styles.flashIconBox}>
                      <Zap size={24} />
                    </div>
                    <div>
                      <h2>Flaş Satış İdarəetməsi</h2>
                      <p>Məhsulları seçin və kampaniya vaxtını təyin edin.</p>
                    </div>
                  </div>
                  <div className={styles.flashHeaderRight}>
                    <div className={styles.flashTimeBox}>
                      <label><Calendar size={16} /> Kampaniyanın Bitmə Vaxtı</label>
                      <input 
                        type="datetime-local" 
                        className={styles.flashDateInput}
                        value={flashSale.targetDate.slice(0, 16)} 
                        onChange={(e) => updateFlashSale({ targetDate: new Date(e.target.value).toISOString() })}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.flashStatsRow}>
                  <div className={styles.flashStatItem}>
                    <span className={styles.flashStatLabel}>Seçilmiş Məhsullar</span>
                    <span className={styles.flashStatVal}>{flashSale.productIds.length} <span className={styles.flashStatValSub}>/ {products.length}</span></span>
                  </div>
                  <div className={styles.flashStatItem}>
                    <span className={styles.flashStatLabel}>Status</span>
                    <span className={styles.flashStatVal} style={{color: '#10b981'}}>Aktiv</span>
                  </div>
                </div>

                <div className={styles.flashProductsGrid}>
                  {products.map(product => {
                    const isSelected = flashSale.productIds.includes(product.id);
                    return (
                      <div 
                        key={product.id} 
                        className={`${styles.flashProductCard} ${isSelected ? styles.flashProductSelected : ''}`}
                        onClick={() => {
                          const newIds = isSelected
                            ? flashSale.productIds.filter(id => id !== product.id)
                            : [...flashSale.productIds, product.id];
                          updateFlashSale({ productIds: newIds });
                        }}
                      >
                        <div className={styles.flashImgWrapper}>
                          <img src={product.img} alt={product.name} onError={e => { e.target.src = 'https://placehold.co/200x200/f5f0e8/D4AF37?text=B'; }} />
                          <div className={styles.flashCheckOverlay}>
                            {isSelected ? <CheckCircle size={32} className={styles.flashCheckIcon} /> : <div className={styles.flashEmptyCircle}></div>}
                          </div>
                        </div>
                        <div className={styles.flashProductInfo}>
                          <span className={styles.flashProductCat}>{categories.find(c => c.id === product.category)?.label}</span>
                          <h4 className={styles.flashProductName}>{product.name}</h4>
                          <span className={styles.flashProductPrice}>{product.price} AZN</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : activeTab === 'Rəylər' ? (
              <motion.div
                key="reviews_manage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2>Müştəri Rəylərinin İdarə Edilməsi</h2>
                  <p>Məhsullarınıza yazılan rəyləri oxuyun, qiymətləndirmələri izləyin və lazım gəldikdə silin.</p>
                </div>

                <div className={styles.reviewsManagerList}>
                  {(() => {
                    const allComments = [];
                    products.forEach(p => {
                      if (p.comments && p.comments.length > 0) {
                        p.comments.forEach(c => {
                          allComments.push({
                            ...c,
                            productId: p.id,
                            productName: p.name,
                            productImg: p.img,
                            productCat: p.category
                          });
                        });
                      }
                    });

                    allComments.sort((a, b) => b.id - a.id);

                    if (allComments.length === 0) {
                      return (
                        <div className={styles.noReviews}>
                          <MessageSquare size={48} className={styles.noReviewsIcon} />
                          <h3>Hələ ki, heç bir rəy yazılmayıb</h3>
                          <p>Müştəriləriniz məhsullarınıza rəy yazdıqda burada görünəcək.</p>
                        </div>
                      );
                    }

                    return (
                      <div className={styles.reviewsGridContainer}>
                        {allComments.map(comment => (
                          <div key={comment.id} className={styles.reviewCardItem}>
                            <div className={styles.reviewCardHeader}>
                              <div className={styles.reviewProductMeta}>
                                <img src={comment.productImg} alt="" className={styles.reviewProductImg} />
                                <div className={styles.reviewProductInfo}>
                                  <h4>{comment.productName}</h4>
                                  <span>{categories.find(c => c.id === comment.productCat)?.label || comment.productCat}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => deleteComment(comment.productId, comment.id)} 
                                className={styles.reviewDeleteBtn}
                                title="Rəyi sil"
                              >
                                <Trash2 size={14} /> Sil
                              </button>
                            </div>

                            <div className={styles.reviewCardBody}>
                              <div className={styles.reviewerMetaRow}>
                                <div className={styles.reviewerAvatar}>
                                  {comment.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.reviewerMain}>
                                  <h5>{comment.name}</h5>
                                  <div className={styles.reviewerRatingDate}>
                                    <div className={styles.reviewStars}>
                                      {[...Array(5)].map((_, i) => (
                                        <svg 
                                          key={i} 
                                          width="14" 
                                          height="14" 
                                          viewBox="0 0 24 24" 
                                          fill={i < comment.rating ? "var(--primary)" : "none"} 
                                          stroke="var(--primary)" 
                                          strokeWidth="2"
                                        >
                                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                      ))}
                                    </div>
                                    <span className={styles.reviewDate}>{comment.date}</span>
                                  </div>
                                </div>
                              </div>
                              <p className={styles.reviewTextVal}>"{comment.text}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            ) : activeTab === 'Müştərilər' ? (
              <motion.div
                key="crm_manage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className={styles.sectionHeader}>
                  <h2>Müştərilər Bazası (CRM)</h2>
                  <p>Saytınızda qeydiyyatdan keçmiş bütün müştəriləri buradan izləyə bilərsiniz.</p>
                </div>

                <div className={styles.crmContainer}>
                  {!users || users.length === 0 ? (
                    <div className={styles.noReviews}>
                      <Users size={48} className={styles.noReviewsIcon} />
                      <h3>Hələ ki, müştəri yoxdur</h3>
                      <p>Qeydiyyatdan keçən müştərilər burada görünəcək.</p>
                    </div>
                  ) : (
                    <div className={styles.crmGrid}>
                      {users.map((u, idx) => {
                        const isMaster = u.email === 'bame@gmail.com';
                        const userOrders = orders.filter(o => (o.customerName || o.clientName || '').toLowerCase() === (u.name || '').toLowerCase());
                        
                        return (
                          <div key={idx} className={styles.crmCard}>
                            <div className={styles.crmCardHeader}>
                              <div className={styles.crmAvatar}>
                                {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className={styles.crmInfo}>
                                <h4>{u.name || 'Adsız İstifadeçi'}</h4>
                                <span>{u.email}</span>
                              </div>
                            </div>
                            <div className={styles.crmStats}>
                              <div className={styles.crmStatItem}>
                                <span>Rol</span>
                                <strong className={isMaster ? styles.adminRoleTxt : ''}>{u.role === 'admin' ? 'İdarəçi' : 'Müştəri'}</strong>
                              </div>
                              <div className={styles.crmStatItem}>
                                <span>Sifarişlər</span>
                                <strong>{userOrders.length}</strong>
                              </div>
                            </div>
                            {!isMaster && (
                              <button 
                                className={styles.crmDeleteBtn}
                                onClick={() => {
                                  if(window.confirm('Bu müştərini sistemdən silmək istədiyinizə əminsiniz?')) {
                                    deleteUser(u.email);
                                  }
                                }}
                              >
                                <Trash2 size={14} /> Sil
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={styles.ordersSection}
              >
                <div className={styles.ordersHeaderArea}>
                  <div>
                    <h2>Sifarişlərin İdarə Edilməsi</h2>
                    <p>Müştərilərin verdiyi sifarişləri təsdiqləyin, yola salın və statuslarını izləyin.</p>
                  </div>
                  
                  {/* Search Bar */}
                  <div className={styles.searchBar}>
                    <Search size={18} />
                    <input 
                      type="text" 
                      placeholder="Müştəri adı, ID və ya telefon..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Filter Tabs */}
                <div className={styles.orderFilters}>
                  {[
                    { id: 'all', label: 'Hamısı', count: orders.length, color: '#888' },
                    { id: 'pending', label: 'Gözləmədə', count: orders.filter(o => o.status === 'pending').length, color: '#ef6c00' },
                    { id: 'approved', label: 'Təsdiqləndi', count: orders.filter(o => o.status === 'approved').length, color: '#1976d2' },
                    { id: 'shipped', label: 'Yoldadır', count: orders.filter(o => o.status === 'shipped').length, color: '#7b1fa2' },
                    { id: 'delivered', label: 'Çatdırıldı', count: orders.filter(o => o.status === 'delivered').length, color: '#2e7d32' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`${styles.filterTab} ${selectedOrderFilter === tab.id ? styles.filterTabActive : ''}`}
                      onClick={() => setSelectedOrderFilter(tab.id)}
                    >
                      <span className={styles.filterDot} style={{ background: tab.color }}></span>
                      <span className={styles.filterLabel}>{tab.label}</span>
                      <span className={styles.filterCount} style={{ background: `${tab.color}15`, color: tab.color }}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Orders List Container */}
                <div className={styles.ordersContainerList}>
                  {filteredOrders.length === 0 ? (
                    <div className={styles.noOrders}>
                      <ShoppingBag size={48} className={styles.noOrdersIcon} />
                      <h3>Sifariş tapılmadı</h3>
                      <p>Seçilmiş filtr və ya axtarış meyarlarına uyğun sifariş yoxdur.</p>
                    </div>
                  ) : (
                    filteredOrders.map(o => {
                      const isExpanded = !!expandedOrders[o.id];
                      const statusStyles = getOrderStatusStyle(o.status);
                      const orderDateFormatted = new Date(o.createdAt || Date.now()).toLocaleString('az-AZ', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      return (
                        <div 
                          key={o.id} 
                          className={`${styles.orderNewCard} ${isExpanded ? styles.cardExpanded : ''}`}
                        >
                          {/* Order Card Header (Summarized Info) */}
                          <div className={styles.orderCardHeader} onClick={() => toggleOrderExpand(o.id)}>
                            <div className={styles.headerMainInfo}>
                              <div className={styles.headerIdArea}>
                                <span className={styles.idBadge}>#{o.id.slice(-6)}</span>
                                <span className={styles.orderDateText}>
                                  <Clock size={12} /> {orderDateFormatted}
                                </span>
                              </div>
                              <div className={styles.headerCustomerArea}>
                                <User size={16} className={styles.infoIcon} />
                                <strong>{o.customerName}</strong>
                              </div>
                            </div>
                            
                            <div className={styles.headerRightInfo}>
                              <div className={styles.headerPriceArea}>
                                <span className={styles.itemCountText}>{o.items?.length || 0} məhsul</span>
                                <strong className={styles.totalPriceText}>{o.total?.toFixed(2) || o.total} AZN</strong>
                              </div>
                              
                              <span 
                                className={styles.statusNewBadge}
                                style={{ 
                                  background: `${statusStyles.color}15`, 
                                  color: statusStyles.color,
                                  borderColor: `${statusStyles.color}30` 
                                }}
                              >
                                {statusStyles.icon}
                                {statusStyles.label}
                              </span>
                              
                              <button className={styles.expandChevronBtn} type="button">
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                          </div>

                          {/* Order Details (Expandable Pane) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className={styles.orderExpandedContent}
                              >
                                <div className={styles.divider}></div>
                                
                                <div className={styles.expandedGrid}>
                                  {/* Left: Customer info & delivery */}
                                  <div className={styles.customerDetailsBox}>
                                    <h4 className={styles.boxTitle}>Çatdırılma & Müştəri Məlumatları</h4>
                                    <div className={styles.infoRows}>
                                      <div className={styles.infoRowItem}>
                                        <User size={16} className={styles.infoRowIcon} />
                                        <div>
                                          <p className={styles.rowLabel}>Müştəri</p>
                                          <p className={styles.rowVal}>{o.customerName}</p>
                                        </div>
                                      </div>
                                      <div className={styles.infoRowItem}>
                                        <Mail size={16} className={styles.infoRowIcon} />
                                        <div>
                                          <p className={styles.rowLabel}>E-poçt</p>
                                          <p className={styles.rowVal}>{o.userEmail || 'Daxil edilməyib'}</p>
                                        </div>
                                      </div>
                                      <div className={styles.infoRowItem}>
                                        <Phone size={16} className={styles.infoRowIcon} />
                                        <div>
                                          <p className={styles.rowLabel}>WhatsApp Nömrəsi</p>
                                          <p className={styles.rowVal}>{o.phone || 'Daxil edilməyib'}</p>
                                        </div>
                                      </div>
                                      <div className={styles.infoRowItem}>
                                        <MapPin size={16} className={styles.infoRowIcon} />
                                        <div>
                                          <p className={styles.rowLabel}>Çatdırılma Ünvanı</p>
                                          <p className={styles.rowVal}>{o.address || 'Qeyd olunmayıb'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className={styles.customerActions}>
                                      {o.phone && (
                                        <a 
                                          href={`https://wa.me/${o.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                            `Salam ${o.customerName}, Bame Gift Shop-dan verdiyiniz #${o.id.slice(-6)} nömrəli sifarişiniz haqqında yazırıq. Sifarişiniz ${o.status === 'pending' ? 'qəbul edildi və təsdiq gözləyir.' : o.status === 'approved' ? 'təsdiqləndi və hazırlanır.' : o.status === 'shipped' ? 'yola salındı, kuryer tezliklə sizinlə əlaqə saxlayacak.' : 'çatdırıldı. Bizi seçdiyiniz üçün təşəkkür edirik! 😊'}`
                                          )}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className={styles.whatsappBtn}
                                        >
                                          <MessageSquare size={16} /> WhatsApp ilə Əlaqə
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: Order items list */}
                                  <div className={styles.orderItemsBox}>
                                    <h4 className={styles.boxTitle}>Sifariş Olunan Məhsullar</h4>
                                    <div className={styles.itemsScrollContainer}>
                                      {o.items && o.items.map((item, index) => (
                                        <div key={index} className={styles.itemDetailRow}>
                                          <img 
                                            src={item.img} 
                                            alt={item.name} 
                                            className={styles.detailItemImg} 
                                            onError={e => { e.target.src = 'https://placehold.co/48x48/f5f0e8/D4AF37?text=B'; }}
                                          />
                                          <div className={styles.detailItemMain}>
                                            <h5>{item.name}</h5>
                                            <p>{item.quantity} ədəd × {item.price} AZN</p>
                                          </div>
                                          <span className={styles.detailItemTotal}>
                                            {(item.price * item.quantity).toFixed(2)} AZN
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className={styles.orderTotalFooter}>
                                      <span>Yekun Məbləğ:</span>
                                      <strong>{o.total?.toFixed(2) || o.total} AZN</strong>
                                    </div>
                                  </div>
                                </div>

                                <div className={styles.divider}></div>

                                {/* Order Status Stepper & Action Controls */}
                                <div className={styles.statusStepperSection}>
                                  <h4 className={styles.boxTitle}>Sifariş Statusu və İdarəedilməsi</h4>
                                  
                                  {/* Interactive progress bar */}
                                  <div className={styles.stepperContainer}>
                                    {[
                                      { statusVal: 'pending', label: 'Gözləmədə', desc: 'Təsdiq gözləyir' },
                                      { statusVal: 'approved', label: 'Təsdiqləndi', desc: 'Hazırlanır' },
                                      { statusVal: 'shipped', label: 'Yoldadır', desc: 'Kuryerdədir' },
                                      { statusVal: 'delivered', label: 'Çatdırıldı', desc: 'Təslim edildi' }
                                    ].map((step, idx) => {
                                      const stepsOrder = ['pending', 'approved', 'shipped', 'delivered'];
                                      const currentIdx = stepsOrder.indexOf(o.status);
                                      const isPassed = idx <= currentIdx;
                                      const isActive = idx === currentIdx;
                                      
                                      return (
                                        <div 
                                          key={step.statusVal} 
                                          className={`${styles.stepperStep} ${isPassed ? styles.stepPassed : ''} ${isActive ? styles.stepActive : ''}`}
                                          onClick={() => updateOrderStatus(o.id, step.statusVal)}
                                        >
                                          <div className={styles.stepDotArea}>
                                            <span className={styles.stepNumber}>
                                              {isPassed && !isActive ? <Check size={12} /> : idx + 1}
                                            </span>
                                          </div>
                                          <div className={styles.stepInfoArea}>
                                            <span className={styles.stepText}>{step.label}</span>
                                            <span className={styles.stepDesc}>{step.desc}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Fast Action Buttons */}
                                  <div className={styles.adminActionControls}>
                                    <span className={styles.actionPromptText}>Sürətli Əməliyyatlar:</span>
                                    <div className={styles.actionButtonsRow}>
                                      {o.status === 'pending' && (
                                        <button 
                                          type="button"
                                          className={`${styles.actionBtn} ${styles.actionBtnApprove}`}
                                          onClick={() => updateOrderStatus(o.id, 'approved')}
                                        >
                                          <CheckCircle size={16} /> Sifarişi Təsdiqlə
                                        </button>
                                      )}
                                      
                                      {(o.status === 'pending' || o.status === 'approved') && (
                                        <button 
                                          type="button"
                                          className={`${styles.actionBtn} ${styles.actionBtnShip}`}
                                          onClick={() => updateOrderStatus(o.id, 'shipped')}
                                        >
                                          <Truck size={16} /> Kuryerə Ver (Yola sal)
                                        </button>
                                      )}

                                      {o.status !== 'delivered' && (
                                        <button 
                                          type="button"
                                          className={`${styles.actionBtn} ${styles.actionBtnDeliver}`}
                                          onClick={() => updateOrderStatus(o.id, 'delivered')}
                                        >
                                          <Check size={16} /> Çatdırıldı Olaraq Qeyd Et
                                        </button>
                                      )}

                                      {/* Dropdown fallback just in case */}
                                      <div className={styles.manualSelectContainer}>
                                        <span>Statusu dəyiş:</span>
                                        <select
                                          value={o.status}
                                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                          className={styles.statusDirectSelect}
                                        >
                                          <option value="pending">Gözləmədə</option>
                                          <option value="approved">Təsdiqləndi</option>
                                          <option value="shipped">Yoldadır</option>
                                          <option value="delivered">Çatdırıldı</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
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
