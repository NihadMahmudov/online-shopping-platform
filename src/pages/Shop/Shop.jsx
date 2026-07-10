import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Star, ShoppingCart, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import styles from './Shop.module.css';

const sortOptions = [
  { value: 'default', label: 'Standart' },
  { value: 'price-asc', label: 'Qiymət: Aşağıdan Yuxarı' },
  { value: 'price-desc', label: 'Qiymət: Yuxarıdan Aşağı' },
  { value: 'rating', label: 'Ən Çox Bəyənilən' },
  { value: 'newest', label: 'Ən Yeni' },
];

import ProductCard from '../../components/common/ProductCard/ProductCard';

const Shop = ({ inPanel = false }) => {
  const { products, categories } = useProducts();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let result = activeCategory === 'all'
      ? [...products]
      : products.filter(p => p.category === activeCategory);

    if (searchQuery.trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => (b.badge === 'Yeni') - (a.badge === 'Yeni')); break;
      default: break;
    }
    return result;
  }, [activeCategory, sortBy, searchQuery, products]);

  return (
    <div className={`${styles.shopPage} ${inPanel ? styles.inPanel : ''}`}>
      {/* Page Header - Only show if not in user panel */}
      {!inPanel && (
        <div className={styles.pageHeader}>
          <div className="container">
            <p className={styles.breadcrumb}>Ana Səhifə / <span>Kolleksiyalar</span></p>
            <h1>Bizim Kolleksiyalarımız</h1>
            <p className={styles.subtitle}>Hər məqsəd üçün mükəmməl hədiyyəni kəşf edin</p>
          </div>
        </div>
      )}

      <div className={`${inPanel ? '' : 'container'} ${styles.shopContainer}`}>
        
        {/* Catalog Header: Search & Sort (Umumi) */}
        <div className={styles.toolBar}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Minlərlə məhsul arasında axtar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.sortWrapper}>
            <button
              className={styles.sortBtn}
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <SlidersHorizontal size={16} />
              {sortOptions.find(s => s.value === sortBy)?.label}
              <ChevronDown size={16} className={showSortDropdown ? styles.rotated : ''} />
            </button>
            {showSortDropdown && (
              <div className={styles.sortDropdown}>
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    className={`${styles.sortOption} ${sortBy === opt.value ? styles.sortActive : ''}`}
                    onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className={styles.resultInfo}>
          <p className={styles.resultCount}>
            {activeCategory !== 'all' && (
              <span className={styles.activeTag}>
                {categories.find(c => c.id === activeCategory)?.label}
                <button onClick={() => setActiveCategory('all')}>×</button>
              </span>
            )}
            <strong>{filteredAndSorted.length}</strong> məhsul tapıldı
          </p>
        </div>

        {/* Product Grid */}
        <motion.div layout className={styles.grid}>
          <AnimatePresence>
            {filteredAndSorted.length > 0 ? (
              filteredAndSorted.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p style={{ textAlign: 'center', padding: '40px', color: '#888', gridColumn: '1/-1' }}>
                Bu kateqoriyada məhsul tapılmadı.
              </p>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
};

export default Shop;
