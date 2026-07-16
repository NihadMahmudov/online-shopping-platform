import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, Search, Star, X, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import styles from './Shop.module.css';
import ProductCard from '../../components/common/ProductCard/ProductCard';

const sortOptions = [
  { value: 'default', label: 'Standart' },
  { value: 'price-asc', label: 'Qiymət: Aşağıdan Yuxarı' },
  { value: 'price-desc', label: 'Qiymət: Yuxarıdan Aşağı' },
  { value: 'rating', label: 'Ən Çox Bəyənilən' },
  { value: 'newest', label: 'Ən Yeni' },
];

const ratingOptions = [
  { value: 0, label: 'Bütün reytinqlər' },
  { value: 4.5, label: '4.5 ★ və yuxarı' },
  { value: 4.0, label: '4.0 ★ və yuxarı' },
  { value: 3.5, label: '3.5 ★ və yuxarı' },
];

const Shop = ({ inPanel = false }) => {
  const { products, categories } = useProducts();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFromUrl = queryParams.get('category') || 'all';
  const searchFromUrl = queryParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [prevCategory, setPrevCategory] = useState(categoryFromUrl);
  const [prevSearch, setPrevSearch] = useState(searchFromUrl);

  if (categoryFromUrl !== prevCategory) {
    setPrevCategory(categoryFromUrl);
    setActiveCategory(categoryFromUrl);
  }
  if (searchFromUrl !== prevSearch) {
    setPrevSearch(searchFromUrl);
    setSearchQuery(searchFromUrl);
  }

  // Filter States
  const maxProductPrice = useMemo(() => {
    if (!products || products.length === 0) return 200;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(250); // Set default buffer or calculate dynamically
  const [minRating, setMinRating] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Dynamic products count per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    if (!products) return counts;
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    if (!products) return [];
    let result = activeCategory === 'all'
      ? [...products]
      : products.filter(p => p.category === activeCategory);

    // Search Query filter
    if (searchQuery.trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Price range filter
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Rating filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Sort order
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => (b.badge === 'Yeni') - (a.badge === 'Yeni')); break;
      default: break;
    }
    return result;
  }, [activeCategory, sortBy, searchQuery, products, minPrice, maxPrice, minRating]);

  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(maxProductPrice);
    setMinRating(0);
    setActiveCategory('all');
    setSearchQuery('');
  };

  const renderFilters = () => (
    <div className={styles.filterContent}>
      {/* Categories filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>Kateqoriyalar</h3>
        <div className={styles.categoryList}>
          <button 
            className={`${styles.categoryFilterBtn} ${activeCategory === 'all' ? styles.activeCategoryBtn : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <span>Bütün Məhsullar</span>
            <span className={styles.itemCount}>{products?.length || 0}</span>
          </button>
          {categories?.filter(c => c.id !== 'all' && !c.storeId).map(cat => (
            <button 
              key={cat.id}
              className={`${styles.categoryFilterBtn} ${activeCategory === cat.id ? styles.activeCategoryBtn : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.label}</span>
              <span className={styles.itemCount}>{categoryCounts[cat.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>Qiymət Aralığı</h3>
        <div className={styles.priceInputsRow}>
          <div className={styles.priceInputBox}>
            <span className={styles.priceLabel}>Min</span>
            <input 
              type="number" 
              value={minPrice} 
              min={0}
              max={maxPrice}
              onChange={e => setMinPrice(Math.max(0, Number(e.target.value)))} 
            />
          </div>
          <div className={styles.priceInputBox}>
            <span className={styles.priceLabel}>Max</span>
            <input 
              type="number" 
              value={maxPrice} 
              min={minPrice}
              max={1000}
              onChange={e => setMaxPrice(Math.max(minPrice, Number(e.target.value)))} 
            />
          </div>
        </div>
        <input 
          type="range" 
          min="0" 
          max={maxProductPrice > 0 ? maxProductPrice : 200} 
          value={maxPrice} 
          onChange={e => setMaxPrice(Number(e.target.value))} 
          className={styles.priceSlider}
        />
        <div className={styles.priceSliderLabels}>
          <span>0 AZN</span>
          <span>{maxProductPrice} AZN</span>
        </div>
      </div>

      {/* Rating filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>Məhsul Reytinqi</h3>
        <div className={styles.ratingFilterList}>
          {ratingOptions.map(opt => (
            <button
              key={opt.value}
              className={`${styles.ratingFilterBtn} ${minRating === opt.value ? styles.activeRatingBtn : ''}`}
              onClick={() => setMinRating(opt.value)}
            >
              <div className={styles.ratingStars}>
                {[...Array(5)].map((_, idx) => (
                  <Star 
                    key={idx} 
                    size={14} 
                    fill={idx < Math.ceil(opt.value) && opt.value > 0 ? '#ffb300' : 'none'} 
                    color={idx < Math.ceil(opt.value) && opt.value > 0 ? '#ffb300' : '#ccc'} 
                  />
                ))}
              </div>
              <span className={styles.ratingLabel}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button className={styles.resetFiltersBtn} onClick={resetFilters}>
        <RotateCcw size={14} /> Sıfırla
      </button>
    </div>
  );

  return (
    <div className={`${styles.shopPage} ${inPanel ? styles.inPanel : ''}`}>
      {/* Page Header */}
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
        
        {/* Catalog Header: Search, Filter Toggle, Sort */}
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

          <button 
            className={styles.filterToggleBtn}
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={16} />
            <span>Filtrlər</span>
            {(minPrice > 0 || maxPrice < maxProductPrice || minRating > 0 || activeCategory !== 'all') && (
              <span className={styles.activeFiltersDot} />
            )}
          </button>

          <div className={styles.sortWrapper}>
            <button
              className={styles.sortBtn}
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <SlidersHorizontal size={16} />
              <span>{sortOptions.find(s => s.value === sortBy)?.label}</span>
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
          <div className={styles.resultCount}>
            <span><strong>{filteredAndSorted.length}</strong> məhsul tapıldı</span>
            {(minPrice > 0 || maxPrice < maxProductPrice || minRating > 0 || activeCategory !== 'all' || searchQuery !== '') && (
              <button onClick={resetFilters} className={styles.clearFiltersBadge}>
                Filtrləri Təmizlə <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Responsive Dual Column Layout */}
        <div className={styles.shopLayout}>
          
          {/* Sticky Sidebar for Desktop */}
          <aside className={styles.sidebar}>
            {renderFilters()}
          </aside>

          {/* Core Product Grid */}
          <div className={styles.mainContent}>
            <motion.div layout className={styles.grid}>
              <AnimatePresence>
                {filteredAndSorted.length > 0 ? (
                  filteredAndSorted.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className={styles.noResultsBox}>
                    <Sparkles size={40} className={styles.noResultsIcon} />
                    <h3>Axtarışınıza uyğun məhsul tapılmadı</h3>
                    <p>Zəhmət olmasa filtrləri dəyişərək yenidən yoxlayın və ya təmizləyin.</p>
                    <button className={styles.resetAllBtn} onClick={resetFilters}>
                      Filtrləri Sıfırla
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>

      </div>

      {/* Slide-over Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div 
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <motion.div 
              className={styles.drawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className={styles.drawerHeader}>
                <h3>Filtrlər</h3>
                <button className={styles.closeBtn} onClick={() => setIsMobileFiltersOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className={styles.drawerContent}>
                {renderFilters()}
              </div>
              <div className={styles.drawerFooter}>
                <button className={styles.drawerResetBtn} onClick={resetFilters}>
                  Sıfırla
                </button>
                <button className={styles.drawerApplyBtn} onClick={() => setIsMobileFiltersOpen(false)}>
                  Tətbiq Et ({filteredAndSorted.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;

