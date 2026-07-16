import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTagClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  return (
    <section className={styles.heroSection}>
      <div className="container">
        {/* Search & Header Panel */}
        <div className={styles.searchHeaderPanel}>
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Şəhərin bütün butikləri <br />
            <span className={styles.italicGold}>tək bir ünvanda.</span>
          </motion.h1>

          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Bakının ən seçkin geyim mağazalarını kəşf edin. <br />
            Mağaza-mağaza gəzmədən trendləri izləyin və yerli brendləri dəstəkləyin.
          </motion.p>

          {/* Elegant Search Bar */}
          <motion.form 
            onSubmit={handleSearchSubmit}
            className={styles.searchForm}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <input 
              type="text" 
              placeholder="Mağaza və ya məhsul axtar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn} aria-label="Axtar">
              <Search size={20} />
            </button>
          </motion.form>
        </div>

        {/* Visual Showcase Category Grid */}
        <div className={styles.showcaseGrid}>
          {/* Large Left Card - Yeni Mövsüm */}
          <motion.div 
            className={`${styles.gridCard} ${styles.largeCard}`}
            onClick={() => navigate('/shop')}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800" 
              alt="Yeni Mövsüm" 
              className={styles.cardImage}
            />
            <div className={styles.cardOverlay}>
              <div className={styles.cardContent}>
                <h3>Yeni Mövsüm</h3>
                <span className={styles.cardLink}>Kolleksiyanı kəşf et <ArrowRight size={14} className={styles.arrowIcon} /></span>
              </div>
            </div>
          </motion.div>

          {/* Right Column (Stacked Cards) */}
          <div className={styles.rightColumn}>
            {/* Top Right Card - Ayaqqabı */}
            <motion.div 
              className={`${styles.gridCard} ${styles.smallCard}`}
              onClick={() => navigate('/shop?category=decor')}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600" 
                alt="Ayaqqabı" 
                className={styles.cardImage}
              />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Ayaqqabı</h3>
                </div>
              </div>
            </motion.div>

            {/* Bottom Right Card - Aksesuarlar */}
            <motion.div 
              className={`${styles.gridCard} ${styles.smallCard}`}
              onClick={() => navigate('/shop?category=accessories')}
              initial={{ opacity: 0, x: 30, y: 15 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600" 
                alt="Aksesuarlar" 
                className={styles.cardImage}
              />
              <div className={styles.cardOverlay}>
                <div className={styles.cardContent}>
                  <h3>Aksesuarlar</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
