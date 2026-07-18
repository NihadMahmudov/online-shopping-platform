import { useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, Search, Star, X, RotateCcw, Sparkles, ArrowLeft } from 'lucide-react';
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
  const navigate = useNavigate();
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


  return (
    <div className={`${styles.shopPage} ${inPanel ? styles.inPanel : ''}`}>
      {/* Page Header */}
      {!inPanel && (
        <div className={styles.pageHeader}>
          <div className="container" style={{ position: 'relative' }}>
            <button 
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginBottom: '10px',
                fontSize: '14px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
            >
              <ArrowLeft size={16} /> Geri Qayıt
            </button>
            <p className={styles.breadcrumb}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Ana Səhifə</Link> / <span>Kolleksiyalar</span>
            </p>
            <h1>Bizim Kolleksiyalarımız</h1>
            <p className={styles.subtitle}>Hər məqsəd üçün mükəmməl hədiyyəni kəşf edin</p>
          </div>
        </div>
      )}

      <div className={`${inPanel ? '' : 'container'} ${styles.shopContainer}`}>
        
        {/* Catalog Header: Search, Sort */}
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

        {/* Responsive Layout */}
        <div className={styles.shopLayout}>
          
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
    </div>
  );
};

export default Shop;

