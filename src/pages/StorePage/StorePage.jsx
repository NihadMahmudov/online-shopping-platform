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
  const { products } = useProducts();
  const { getStoreProfile } = useStore();

  const storeProducts = React.useMemo(() => {
    return products.filter(p => p.storeId === storeId);
  }, [products, storeId]);

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

      {/* Store Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statBox}>
          <Package size={20} className={styles.statIcon} />
          <div>
            <strong>{storeProducts.length}</strong>
            <span>Məhsul sayı</span>
          </div>
        </div>
        <div className={styles.statBox}>
          <Calendar size={20} className={styles.statIcon} />
          <div>
            <strong>{new Date().toLocaleDateString('az-AZ', { month: 'long', year: 'numeric' })}</strong>
            <span>Qeydiyyat</span>
          </div>
        </div>
      </div>

      {/* Store Products */}
      <div className={styles.productsSection}>
        <h2 className={styles.sectionTitle}>Mağazanın Məhsulları</h2>
        {storeProducts.length === 0 ? (
          <div className={styles.noProducts}>
            <Store size={48} />
            <h3>Mağazada məhsul tapılmadı</h3>
            <p>Bu mağaza hələ ki məhsul əlavə etməyib.</p>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {storeProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
