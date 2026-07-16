import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import styles from './Hero.module.css';

const Hero = () => {
  const navigate = useNavigate();
  const { showcaseCards } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const mainCard = showcaseCards?.find(c => c.type === 'main') || {
    id: 'main',
    title: 'Yeni Mövsüm',
    subtitle: 'Kolleksiyanı kəşf et',
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    link: '/shop'
  };

  const rightCards = showcaseCards?.filter(c => c.type === 'right') || [];
  const bottomCards = showcaseCards?.filter(c => c.type === 'bottom') || [];

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
          {/* Large Left Card - Dynamic */}
          <motion.div 
            className={`${styles.gridCard} ${styles.largeCard}`}
            onClick={() => navigate(mainCard.link || '/shop')}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <img 
              src={mainCard.img} 
              alt={mainCard.title} 
              className={styles.cardImage}
            />
            <div className={styles.cardOverlay}>
              <div className={styles.cardContent}>
                <h3>{mainCard.title}</h3>
                <span className={styles.cardLink}>
                  {mainCard.subtitle || 'Kolleksiyanı kəşf et'} <ArrowRight size={14} className={styles.arrowIcon} />
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column (Dynamic Grid Cards) */}
          <div className={styles.rightColumn}>
            {rightCards.map((card, idx) => (
              <motion.div 
                key={card.id}
                className={`${styles.gridCard} ${styles.smallCard}`}
                onClick={() => navigate(card.link || '/shop')}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 + (idx * 0.05) }}
                whileHover={{ y: -5 }}
              >
                <img 
                  src={card.img} 
                  alt={card.title} 
                  className={styles.cardImage}
                />
                <div className={styles.cardOverlay}>
                  <div className={styles.cardContent}>
                    <h3>{card.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dynamic Bottom Row Showcase Grid */}
        {bottomCards.length > 0 && (
          <div className={styles.bottomRowGrid}>
            {bottomCards.map((card, idx) => (
              <motion.div 
                key={card.id}
                className={`${styles.gridCard} ${styles.bottomCard}`}
                onClick={() => navigate(card.link || '/shop')}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 + (idx * 0.08) }}
                whileHover={{ y: -5 }}
              >
                <img 
                  src={card.img} 
                  alt={card.title} 
                  className={styles.cardImage}
                />
                <div className={styles.cardOverlay}>
                  <div className={styles.cardContent}>
                    <h3>{card.title}</h3>
                    <span className={styles.cardLink}>
                      {card.subtitle || 'Kəşf et'} <ArrowRight size={14} className={styles.arrowIcon} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
