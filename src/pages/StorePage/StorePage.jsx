import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import { motion } from 'framer-motion';
import { Store, Phone, MapPin, Mail, ArrowLeft, Package, Calendar } from 'lucide-react';
import styles from './StorePage.module.css';

const StorePage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { products, categories } = useProducts();
  const { getStoreProfile } = useStore();

  const [selectedStoreCategory, setSelectedStoreCategory] = useState('all');
  const [prevStoreId, setPrevStoreId] = useState(storeId);

  if (storeId !== prevStoreId) {
    setPrevStoreId(storeId);
    setSelectedStoreCategory('all');
  }

  const storeProducts = React.useMemo(() => {
    return products.filter(p => p.storeId === storeId);
  }, [products, storeId]);

  const storeCategories = React.useMemo(() => {
    return categories.filter(c => c.storeId === storeId);
  }, [categories, storeId]);

  const filteredProducts = React.useMemo(() => {
    if (selectedStoreCategory === 'all') return storeProducts;
    return storeProducts.filter(p => p.storeCategory === selectedStoreCategory);
  }, [storeProducts, selectedStoreCategory]);

  const storeProfile = React.useMemo(() => {
    return getStoreProfile(storeId);
  }, [storeId, getStoreProfile]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [storeId]);

  // Determine store name (from products or profile or default)
  const storeName = storeProfile.storeName || (storeProducts[0]?.storeName) || 'AtlasMall Mağazası';
  const description = storeProfile.description || 'AtlasMall platformasında fəaliyyət göstərən premium mağaza. Geniş məhsul çeşidi və yüksək keyfiyyət.';
  const banner = storeProfile.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200';
  const logo = storeProfile.logo || '';
  const phone = storeProfile.phone || '+994 50 123 45 67';
  const email = storeProfile.email || 'support@atlasmall.com';
  const address = storeProfile.address || 'Bakı, Azərbaycan';

  return (
    <div className={`container ${styles.page}`}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Geri Qayıt
      </button>

      {/* Store Header Card */}
      <motion.div 
        className={styles.headerCard}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.bannerWrapper}>
          <img src={banner} alt={storeName} className={styles.bannerImg} />
          <div className={styles.bannerOverlay}></div>
        </div>

        <div className={styles.profileSection}>
          <div className={styles.avatarWrapper}>
            {logo ? (
              <img src={logo} alt={storeName} className={styles.logoImg} />
            ) : (
              <div className={styles.defaultLogo}>
                <Store size={36} />
              </div>
            )}
          </div>

          <div className={styles.storeDetails}>
            <div className={styles.titleRow}>
              <h1>{storeName}</h1>
              <span className={styles.verifiedBadge}>Təsdiqlənmiş Mağaza</span>
            </div>
            <p className={styles.description}>{description}</p>

            <div className={styles.contactRow}>
              <div className={styles.contactItem}><Phone size={14} /> <span>{phone}</span></div>
              <div className={styles.contactItem}><Mail size={14} /> <span>{email}</span></div>
              <div className={styles.contactItem}><MapPin size={14} /> <span>{address}</span></div>
            </div>
          </div>
        </div>
      </motion.div>


      {/* Store Products */}
      <div className={styles.productsSection}>
        <h2 className={styles.sectionTitle}>Mağazanın Məhsulları</h2>

        {/* Store Custom Categories Filter */}
        {storeProducts.length > 0 && storeCategories.length > 0 && (
          <motion.div 
            className={styles.categoryFilterContainer}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.button 
              className={`${styles.filterBtn} ${selectedStoreCategory === 'all' ? styles.filterBtnActive : ''} ${storeProducts.length === 0 ? styles.emptyCategory : ''}`}
              onClick={() => setSelectedStoreCategory('all')}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={styles.categoryLabelText}>Hamısı</span>
              <span className={styles.countBadge}>{storeProducts.length}</span>
            </motion.button>
            {storeCategories.map(cat => {
              const count = storeProducts.filter(p => p.storeCategory === cat.id).length;
              const isActive = selectedStoreCategory === cat.id;
              return (
                <motion.button 
                  key={cat.id}
                  className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''} ${count === 0 ? styles.emptyCategory : ''}`}
                  onClick={() => setSelectedStoreCategory(cat.id)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  title={cat.label}
                >
                  <span className={styles.categoryLabelText}>{cat.label}</span>
                  <span className={styles.countBadge}>{count}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {storeProducts.length === 0 ? (
          <div className={styles.noProducts}>
            <Store size={48} />
            <h3>Mağazada məhsul tapılmadı</h3>
            <p>Bu mağaza hələ ki məhsul əlavə etməyib.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.noProducts}>
            <Store size={48} />
            <h3>Bu kateqoriyada məhsul yoxdur</h3>
            <p>Seçdiyiniz kateqoriyada hələ ki məhsul yerləşdirilməyib.</p>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
