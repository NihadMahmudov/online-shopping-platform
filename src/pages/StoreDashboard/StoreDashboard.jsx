import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, PlusCircle, Trash2, Edit,
  LogOut, Store, TrendingUp, ShoppingBag, Eye, ImagePlus,
  ShoppingCart, Zap, Calendar, CheckCircle, Camera,
  Phone, MapPin, User, Users, Clock, MessageSquare, Check, Truck,
  ChevronDown, ChevronUp, Mail, Search, Tag, Menu, X, Settings, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useStore } from '../../context/StoreContext';
import { useNotifications } from '../../context/NotificationContext';
import styles from './StoreDashboard.module.css';

const TABS = ['Məhsullarım', 'Məhsul Əlavə Et', 'Mağaza Kateqoriyaları', 'Sifarişlər', 'Bildirişlər', 'Analitika', 'Rəylər', 'Mağaza Parametrləri'];

const StoreDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    products, addProduct, deleteProduct, updateProduct,
    categories, addCategory, deleteCategory,
    badges,
    collections,
    flashSale, updateFlashSale,
    deleteComment
  } = useProducts();
  
  const { orders, updateOrderStatus, getOrdersByStore, getRevenueByStore } = useOrders();
  const { storeProfiles, updateStoreProfile, getStoreProfile } = useStore();
  const { getFilteredNotifications, markAsRead, markAllAsRead } = useNotifications();

  const [activeTab, setActiveTab] = useState('Məhsullarım');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', price: '', oldPrice: '', category: 'decor', storeCategory: '',
    img: '', images: [], description: '', badge: '', collections: []
  });
  
  const [success, setSuccess] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [submitError, setSubmitError] = useState('');



  // Edit Product States
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', price: '', oldPrice: '', category: 'decor', storeCategory: '',
    img: '', description: '', badge: '', collections: []
  });
  const [editSuccess, setEditSuccess] = useState(false);

  const startEditing = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      price: product.price !== undefined ? String(product.price) : '',
      oldPrice: product.oldPrice !== undefined && product.oldPrice !== null ? String(product.oldPrice) : '',
      category: product.category || 'decor',
      storeCategory: product.storeCategory || '',
      img: product.img || '',
      description: product.description || '',
      badge: product.badge || '',
      collections: product.collections || []
    });
    setEditSuccess(false);
  };

  const handleEditChange = e => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditCollectionChange = (id) => {
    setEditForm(prev => ({
      ...prev,
      collections: prev.collections.includes(id)
        ? prev.collections.filter(c => c !== id)
        : [...prev.collections, id]
    }));
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = e => {
    e.preventDefault();
    if (!editForm.name || !editForm.price || !editForm.img) return;
    updateProduct(editingProduct.id, {
      name: editForm.name,
      price: Number(editForm.price),
      oldPrice: editForm.oldPrice ? Number(editForm.oldPrice) : null,
      category: editForm.category,
      storeCategory: editForm.storeCategory || null,
      img: editForm.img,
      description: editForm.description,
      badge: editForm.badge,
      collections: editForm.collections
    });
    
    setEditSuccess(true);
    setTimeout(() => { 
      setEditSuccess(false); 
      setEditingProduct(null); 
    }, 1200);
  };

  // Store-specific Category States
  const [newStoreCatLabel, setNewStoreCatLabel] = useState('');
  const [storeCatSuccess, setStoreCatSuccess] = useState(false);

  const handleAddStoreCategory = (e) => {
    e.preventDefault();
    if (!newStoreCatLabel.trim()) return;
    addCategory(newStoreCatLabel.trim(), user.storeId);
    setNewStoreCatLabel('');
    setStoreCatSuccess(true);
    setTimeout(() => setStoreCatSuccess(false), 2000);
  };

  // Settings States
  const [settingsForm, setSettingsForm] = useState(() => {
    if (user?.storeId) {
      const prof = getStoreProfile(user.storeId) || {};
      return {
        storeName: prof.storeName || user.storeName || '',
        description: prof.description || '',
        banner: prof.banner || '',
        logo: prof.logo || '',
        phone: prof.phone || '',
        email: prof.email || user.email || '',
        address: prof.address || ''
      };
    }
    return {
      storeName: '',
      description: '',
      banner: '',
      logo: '',
      phone: '',
      email: '',
      address: ''
    };
  });

  const [prevStoreId, setPrevStoreId] = useState(user?.storeId);
  const [prevProfilesHash, setPrevProfilesHash] = useState(() => JSON.stringify(storeProfiles));

  const currentProfilesHash = JSON.stringify(storeProfiles);
  if (user?.storeId !== prevStoreId || currentProfilesHash !== prevProfilesHash) {
    setPrevStoreId(user?.storeId);
    setPrevProfilesHash(currentProfilesHash);
    if (user?.storeId) {
      const prof = getStoreProfile(user.storeId) || {};
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
  }

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

  // Flash Sale States
  const [flashTarget, setFlashTarget] = useState(
    flashSale?.targetDate ? new Date(flashSale.targetDate).toISOString().substring(0, 16) : ''
  );

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
      case 'Mağaza Kateqoriyaları': return <Tag size={18} />;
      case 'Sifarişlər': return <ShoppingBag size={18} />;
      case 'Bildirişlər': return <Bell size={18} />;
      case 'Analitika': return <TrendingUp size={18} />;
      case 'Rəylər': return <MessageSquare size={18} />;
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

  const storeNotifications = getFilteredNotifications(user?.email, user?.storeId, false);

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
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const readers = files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(results => {
      setForm(prev => ({
        ...prev,
        img: results[0],
        images: results
      }));
    });
  };

  const handleRemoveImage = (index) => {
    setForm(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: newImages, img: newImages[0] || '' };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.price || !form.img) return;
    setSubmittingProduct(true);
    setSubmitError('');

    try {
      await addProduct({
        name: form.name,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        category: form.category,
        storeCategory: form.storeCategory || null,
        img: form.img,
        images: form.images.length > 0 ? form.images : [form.img],
        description: form.description,
        badge: form.badge,
        collections: form.collections
      }, user.storeId, user.storeName);
      
      setForm({ name: '', price: '', oldPrice: '', category: 'decor', storeCategory: '', img: '', images: [], description: '', badge: '', collections: [] });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setActiveTab('Məhsullarım'); }, 1500);
    } catch (err) {
      console.error('Product creation error:', err);
      setSubmitError('Məhsul bazaya əlavə edilərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setSubmittingProduct(false);
    }
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={styles.statusBox}
        >
          <div className={styles.statusIconPending}>
            <Clock size={40} />
          </div>
          <h1>Təsdiq Gözlənilir</h1>
          <p>Hörmətli <strong>{user.storeName || user.name}</strong>, mağazanız hazırda AtlasMall administratorları tərəfindən nəzərdən keçirilir. Əməkdaşlığınız üçün təşəkkür edirik!</p>
          
          <div className={styles.supportInfo}>
            <div className={styles.supportRow}>
              <Mail size={16} />
              <span>Dəstək poçtu: <strong>support@atlasmall.com</strong></span>
            </div>
            <div className={styles.supportRow}>
              <Phone size={16} />
              <span>Əlaqə nömrəsi: <strong>+994 12 400 90 90</strong></span>
            </div>
          </div>

          <div className={styles.statusActions}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.logoutBtnInline} 
              onClick={() => { logout(); navigate('/'); }}
            >
              <LogOut size={16} /> Çıxış Et
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={styles.homeBtnInline} 
              onClick={() => navigate('/')}
            >
              Ana Səhifəyə Get
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (user.status === 'suspended') {
    return (
      <div className={styles.statusPage}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={styles.statusBox}
        >
          <div className={styles.statusIconSuspended}>
            <X size={40} />
          </div>
          <h1>Hesabınız Dondurulub</h1>
          <p>Hörmətli <strong>{user.storeName || user.name}</strong>, mağazanızın fəaliyyəti AtlasMall platforma qaydalarına uyğun olaraq müvəqqəti dayandırılmışdır.</p>
          
          <div className={styles.supportInfo}>
            <div className={styles.supportRow}>
              <Mail size={16} />
              <span>İdarəçi e-poçtu: <strong>admin@atlasmall.com</strong></span>
            </div>
            <div className={styles.supportRow}>
              <Phone size={16} />
              <span>Qaynar xətt: <strong>+994 12 400 90 90</strong></span>
            </div>
          </div>

          <div className={styles.statusActions}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.logoutBtnInline} 
              onClick={() => { logout(); navigate('/'); }}
            >
              <LogOut size={16} /> Çıxış Et
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={styles.homeBtnInline} 
              onClick={() => navigate('/')}
            >
              Ana Səhifəyə Get
            </motion.button>
          </div>
        </motion.div>
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
              editingProduct ? (
                <motion.div
                  key="edit-product-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={styles.addForm}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h2>Məhsulu Redaktə Et</h2>
                      <p>"{editingProduct.name}" məhsulunun məlumatlarını tənzimləyin.</p>
                    </div>
                    <button 
                      type="button"
                      className={styles.addBtn}
                      onClick={() => setEditingProduct(null)}
                      style={{ background: '#64748B', color: '#FFF' }}
                    >
                      Geri Qayıt
                    </button>
                  </div>

                  {editSuccess && (
                    <div className={styles.successMsg} style={{ marginBottom: '16px' }}>
                      ✅ Məhsul uğurla yeniləndi!
                    </div>
                  )}

                  <form onSubmit={handleEditSubmit} className={styles.premiumForm}>
                    {/* Left Column: Main Info */}
                    <div className={styles.formColumn}>
                      <div className={styles.formSectionBox}>
                        <h3 className={styles.boxTitle}>Əsas Məlumatlar</h3>
                        
                        <div className={styles.formGroup}>
                          <label>Məhsul Adı *</label>
                          <div className={styles.inputWrapper}>
                            <Package size={18} className={styles.inputIcon} />
                            <input name="name" value={editForm.name} onChange={handleEditChange} placeholder="məs. Zərif Gümüş Sırğalar" required />
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Məhsulun Təsviri</label>
                          <textarea 
                            name="description" 
                            value={editForm.description} 
                            onChange={handleEditChange} 
                            placeholder="Məhsul haqqında ətraflı məlumat..." 
                            rows="4"
                            className={styles.premiumTextarea}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className={styles.formGroup}>
                            <label>Qiymət (AZN) *</label>
                            <div className={styles.inputWrapper}>
                              <span className={styles.currencySymbol}>₼</span>
                              <input name="price" type="number" value={editForm.price} onChange={handleEditChange} placeholder="0.00" required />
                            </div>
                          </div>
                          <div className={styles.formGroup}>
                            <label>Köhnə Qiymət (AZN)</label>
                            <div className={styles.inputWrapper}>
                              <span className={styles.currencySymbol}>₼</span>
                              <input name="oldPrice" type="number" value={editForm.oldPrice} onChange={handleEditChange} placeholder="0.00" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Meta Info & Media */}
                    <div className={styles.formColumn}>
                      <div className={styles.formSectionBox}>
                        <h3 className={styles.boxTitle}>Kateqoriya və Etiket</h3>
                        <div className={styles.formGroup}>
                          <label>Platforma Kateqoriyası (Superadmin) *</label>
                          <div className={styles.inputWrapper}>
                            <LayoutDashboard size={18} className={styles.inputIcon} />
                            <select name="category" value={editForm.category} onChange={handleEditChange}>
                              {categories.filter(c => c.id !== 'all' && !c.storeId).map(c => (
                                <option key={c.id} value={c.id}>{c.label || c.name || c.id}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Öz Mağaza Kateqoriyanız</label>
                          <div className={styles.inputWrapper}>
                            <Tag size={18} className={styles.inputIcon} />
                            <select name="storeCategory" value={editForm.storeCategory} onChange={handleEditChange}>
                              <option value="">Heç biri / Yoxdur</option>
                              {categories.filter(c => c.storeId === user?.storeId).map(c => (
                                <option key={c.id} value={c.id}>{c.label || c.name || c.id}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Etiket (Badge)</label>
                          <div className={styles.inputWrapper}>
                            <Tag size={18} className={styles.inputIcon} />
                            <select name="badge" value={editForm.badge} onChange={handleEditChange}>
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
                          <input type="file" accept="image/*" onChange={handleEditImageUpload} />
                          {editForm.img ? (
                            <div className={styles.imgPreviewContainer}>
                              <img src={editForm.img} alt="preview" className={styles.imgPreviewFull} />
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

                    <div style={{ gridColumn: 'span 2' }}>
                      <button type="submit" className={styles.submitBtn} style={{ width: '100%' }}>
                        <Check size={20} /> Məlumatları Yenilə
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className={styles.sectionHeader}>
                    <h2>Bütün Məhsullar ({storeProducts.length})</h2>
                  </div>

                  {/* Desktop Table */}
                  <div className={`${styles.tableCard} ${styles.desktopOnly}`}>
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
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button 
                                className={styles.deleteBtn} 
                                style={{ color: '#64748B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => startEditing(p)}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; }}
                                title="Redaktə et"
                              >
                                <Edit size={16} />
                              </button>
                              <button className={styles.deleteBtn} onClick={() => deleteProduct(p.id)} title="Sil">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Mobile Cards */}
                  <div className={styles.mobileCards}>
                    {storeProducts.length === 0 ? (
                      <div className={styles.noData}>Məhsul tapılmadı. Yeni məhsul əlavə edin.</div>
                    ) : (
                      storeProducts.map(p => (
                        <div key={p.id} className={styles.premiumCard}>
                          <div className={styles.premiumCardTop}>
                            <img 
                              src={p.img} 
                              alt={p.name} 
                              onError={e => { e.target.src = 'https://placehold.co/48x48/f5f0e8/D4AF37?text=B'; }} 
                              style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                            />
                            <div className={styles.premiumCardInfo}>
                              <h3>{p.name}</h3>
                              <p className={styles.priceCell} style={{ fontWeight: 700, color: '#9A7D0A', fontSize: '0.92rem' }}>{p.price} AZN</p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <button 
                                className={styles.actionBtnGhost} 
                                style={{ padding: '8px' }}
                                onClick={() => startEditing(p)}
                                title="Redaktə et"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                className={styles.actionBtnGhost} 
                                style={{ padding: '8px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.15)' }}
                                onClick={() => deleteProduct(p.id)} 
                                title="Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className={styles.premiumCardChips}>
                            <div className={styles.chipRow}>
                              <div className={styles.chip}>
                                <span className={styles.chipIcon}>🏷️</span>
                                <span>{categories.find(c => c.id === p.category)?.label || p.category}</span>
                              </div>
                              <div className={styles.chip}>
                                <span className={styles.chipIcon}>⭐</span>
                                <span>{p.rating || 5.0} reytinq</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )
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

                {submitError && (
                  <div className={styles.errorMsg} style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px', fontSize: '0.9rem' }}>
                    ❌ {submitError}
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
                  </div>

                  {/* Right Column: Meta Info & Media */}
                  <div className={styles.formColumn}>
                    <div className={styles.formSectionBox}>
                      <h3 className={styles.boxTitle}>Kateqoriya və Etiket</h3>
                      <div className={styles.formGroup}>
                        <label>Platforma Kateqoriyası (Superadmin) *</label>
                        <div className={styles.inputWrapper}>
                          <LayoutDashboard size={18} className={styles.inputIcon} />
                          <select name="category" value={form.category} onChange={handleChange}>
                            {categories.filter(c => c.id !== 'all' && !c.storeId).map(c => (
                              <option key={c.id} value={c.id}>{c.label || c.name || c.id}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Öz Mağaza Kateqoriyanız</label>
                        <div className={styles.inputWrapper}>
                          <Tag size={18} className={styles.inputIcon} />
                          <select name="storeCategory" value={form.storeCategory} onChange={handleChange}>
                            <option value="">Heç biri / Yoxdur</option>
                            {categories.filter(c => c.storeId === user?.storeId).map(c => (
                              <option key={c.id} value={c.id}>{c.label || c.name || c.id}</option>
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
                      <h3 className={styles.boxTitle}>Məhsul Şəkilləri * <span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#94A3B8' }}>(Maks. 5 şəkil)</span></h3>

                      {/* Uploaded images gallery */}
                      {form.images.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                          {form.images.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1', border: idx === 0 ? '2.5px solid #D4AF37' : '1.5px solid #E2E8F0' }}>
                              <img src={img} alt={`şəkil ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {idx === 0 && (
                                <span style={{ position: 'absolute', top: 4, left: 4, background: '#D4AF37', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '2px 5px', borderRadius: '4px' }}>ANA</span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload trigger */}
                      {form.images.length < 5 && (
                        <div className={styles.imageUploadBox}>
                          <input type="file" accept="image/*" multiple onChange={handleImageUpload} required={!form.img} />
                          <div className={styles.uploadIconWrapper}>
                            <ImagePlus size={28} />
                          </div>
                          <div className={styles.uploadText}>
                            {form.images.length === 0 ? 'Şəkillər yükləmək üçün klikləyin' : `Daha şəkil əlavə edin (${form.images.length}/5)`}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '4px' }}>İlk seçilən şəkil ana şəkil olacaq</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={submittingProduct}>
                    {submittingProduct ? (
                      <>⏳ Şəkil Cloudinary-ə yüklənir və baza yenilənir...</>
                    ) : (
                      <><PlusCircle size={20} /> Məhsul Əlavə Et</>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : activeTab === 'Mağaza Kateqoriyaları' ? (
              <motion.div
                key="store-categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={styles.premiumForm}
                style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Öz Mağaza Kateqoriyalarınız</h2>
                  <p style={{ fontSize: '0.9rem', color: '#64748B' }}>Mağazanız üçün xüsusi kateqoriyalar yaradın. Bu kateqoriyalar yalnız müştərilər sizin mağaza səhifənizə daxil olduqda görünəcək.</p>
                </div>

                <form onSubmit={handleAddStoreCategory} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', maxWidth: '500px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Kateqoriya Adı *</label>
                    <input 
                      type="text" 
                      value={newStoreCatLabel} 
                      onChange={(e) => setNewStoreCatLabel(e.target.value)} 
                      placeholder="məs. Əl işi Şamlar" 
                      required 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                  </div>
                  <button type="submit" style={{ padding: '10px 20px', background: '#D4AF37', color: '#FFFFFF', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <PlusCircle size={16} /> Əlavə Et
                  </button>
                </form>

                {storeCatSuccess && (
                  <div style={{ color: '#15803D', background: '#DCFCE7', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, maxWidth: '500px' }}>
                    ✅ Kateqoriya uğurla əlavə edildi!
                  </div>
                )}

                <div style={{ marginTop: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1E293B', marginBottom: '12px' }}>Aktiv Mağaza Kateqoriyaları</h3>
                  
                  {categories.filter(c => c.storeId === user.storeId).length === 0 ? (
                    <div style={{ color: '#64748B', fontSize: '0.9rem', padding: '16px', border: '1px dashed #CBD5E1', borderRadius: '8px', textAlign: 'center' }}>
                      Heç bir xüsusi kateqoriya yaradılmayıb. İlk kateqoriyanızı yuxarıdan əlavə edin.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                      {categories.filter(c => c.storeId === user.storeId).map(cat => (
                        <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                          <span style={{ fontWeight: 500, color: '#0F172A', fontSize: '0.95rem' }}>{cat.label}</span>
                          <button 
                            type="button"
                            onClick={() => deleteCategory(cat.id)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

                {/* Desktop Table */}
                <div className={`${styles.tableCard} ${styles.desktopOnly}`}>
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

                {/* Mobile Cards */}
                <div className={styles.mobileCards}>
                  {storeOrders.length === 0 ? (
                    <div className={styles.noData}>Mağazanıza aid sifariş tapılmadı.</div>
                  ) : (
                    storeOrders.map(o => (
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
            ) : activeTab === 'Bildirişlər' ? (
              <motion.div
                key="notifications-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>Mağaza Bildirişləri və Mesajlar 🔔</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Müştəri sifarişləri, SuperAdmin elanları və sistem xəbərdarlıqları</p>
                  </div>
                  {storeNotifications.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => markAllAsRead(user?.email, user?.storeId, false)}
                        style={{ padding: '8px 14px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Check size={16} /> Hamısını Oxunmuş Et
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {storeNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                      <Bell size={48} style={{ color: '#94A3B8', opacity: 0.4, marginBottom: '12px' }} />
                      <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '4px' }}>Bildirişiniz yoxdur</h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Mağazanıza gələn bütün sifariş mesajları və elanlar burada görünəcək.</p>
                    </div>
                  ) : (
                    storeNotifications.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        style={{
                          background: !n.read ? 'rgba(67, 97, 238, 0.05)' : '#FFFFFF',
                          border: !n.read ? '1.5px solid rgba(67, 97, 238, 0.3)' : '1px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '16px 20px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '50px', background: '#EEF2FF', color: '#4361EE', fontSize: '0.75rem', fontWeight: 700 }}>
                              {n.sender || '🔔 Sistem Bildirişi'}
                            </span>
                            {!n.read && (
                              <span style={{ padding: '2px 8px', borderRadius: '50px', background: '#EF4444', color: '#FFF', fontSize: '0.65rem', fontWeight: 800 }}>YENİ</span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {new Date(n.createdAt).toLocaleDateString('az-AZ')} {new Date(n.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{n.title}</h4>
                        <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                      </div>
                    ))
                  )}
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
                        placeholder="Mingəçevir, H.Əliyev pr. 12"
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
