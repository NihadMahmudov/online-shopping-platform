import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import styles from './Categories.module.css';

const Categories = ({ inPanel = false }) => {
  const navigate = useNavigate();
  const { categories } = useProducts();

  const handleCategoryClick = (catId) => {
    navigate(`/shop?category=${catId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    show: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <div className={`${styles.pageContainer} ${inPanel ? styles.inPanel : ''}`}>
      {/* Search Header */}
      {!inPanel && (
        <div className={styles.searchHeader}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input type="text" placeholder="Brend, məhsul və ya kateqoriya axtar" />
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className={styles.mainLayout}>
        {/* Content Area */}
        <div className={styles.content}>
          {!inPanel && (
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Kateqoriyalar</h1>
              <p className={styles.pageSubtitle}>Şəhərimizin seçkin butiklərinin kolleksiyalarını kateqoriyalar üzrə kəşf edin</p>
            </div>
          )}
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={styles.categoryGrid}
          >
            {categories.filter(c => c.id !== 'all').map(cat => (
              <motion.div 
                key={cat.id} 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.catCard} 
                onClick={() => handleCategoryClick(cat.id)}
              >
                <div className={styles.catImageWrapper}>
                  <img 
                    src={cat.img || 'https://placehold.co/250x250/f5f0e8/D4AF37?text=' + cat.label} 
                    alt={cat.label} 
                  />
                  <div className={styles.cubeBadge}>📦</div>
                </div>
                <span className={styles.catName}>{cat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
