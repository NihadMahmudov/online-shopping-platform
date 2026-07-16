import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../common/ProductCard/ProductCard';
import styles from './ProductShowcase.module.css';

const ProductShowcase = () => {
  const { products = [], categories = [] } = useProducts() || {};
  const [activeCategory, setActiveCategory] = useState('all');


  // Filter products by active category. We display a maximum of 8 products on the home page.
  const filteredProducts = useMemo(() => {
    const list = activeCategory === 'all'
      ? products
      : products.filter(p => p.category === activeCategory);
    return list.slice(0, 8);
  }, [activeCategory, products]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <section className={styles.section}>
      <div className="container">
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={13} className={styles.sparkleIcon} />
            MƏHSULLARIMIZ
          </div>
          <h2 className={styles.title}>Populyar Məhsullar</h2>
          <p className={styles.subtitle}>AtlasMall tərəfindən sizin üçün xüsusi seçilmiş premium məhsullar</p>
        </div>

        {/* Category Filters */}
        <div className={styles.filtersWrapper}>
          <div className={styles.filters}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ''}`}
              >
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="activeHomeCategory"
                    className={styles.activeBg}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={styles.btnLabel}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: 'var(--text-muted)'
          }}>
            <p>Bu kateqoriyada məhsul tapılmadı</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={styles.grid}
            key={activeCategory}
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* View All Button */}
        <div className={styles.footerAction}>
          <Link to="/shop" className={styles.shopMoreBtn}>
            Bütün Məhsulları Gör <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
