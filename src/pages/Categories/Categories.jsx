import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shirt, 
  User, 
  Baby, 
  ShoppingBag, 
  Watch, 
  Crown, 
  Sparkles, 
  Home, 
  Flame, 
  Gift, 
  Headphones, 
  ArrowRight,
  FolderTree
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import styles from './Categories.module.css';

// Minimalist vector icons for categories
const CATEGORY_ICONS = {
  women: Shirt,
  men: User,
  kids: Baby,
  shoes: ShoppingBag,
  accessories: Watch,
  jewelry: Crown,
  beauty: Sparkles,
  decor: Home,
  candles: Flame,
  sets: Gift,
  electronics: Headphones,
  default: FolderTree
};

const Categories = ({ inPanel = false }) => {
  const navigate = useNavigate();
  const { categories, products } = useProducts();

  // Compute product counts per main category
  const categoryCounts = useMemo(() => {
    const map = {};
    if (products && Array.isArray(products)) {
      products.forEach(p => {
        if (p.category) {
          map[p.category] = (map[p.category] || 0) + 1;
        }
      });
    }
    return map;
  }, [products]);

  // Main categories excluding 'all'
  const mainCategories = useMemo(() => {
    return categories.filter(c => c.id !== 'all');
  }, [categories]);

  const handleCategoryClick = (catId) => {
    navigate(`/shop?category=${catId}`);
  };

  return (
    <div className={`${styles.pageWrapper} ${inPanel ? styles.inPanel : ''}`}>
      <div className={styles.container}>
        {/* Minimalist Grid of Clean Cards */}
        <div className={styles.cleanGrid}>
          {mainCategories.map((cat, idx) => {
            const count = categoryCounts[cat.id] || 0;
            const IconComponent = CATEGORY_ICONS[cat.id] || CATEGORY_ICONS.default;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className={styles.simpleCard}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <div className={styles.cardLeft}>
                  <div className={styles.iconCircle}>
                    <IconComponent size={22} />
                  </div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.categoryTitle}>{cat.label || cat.name}</h3>
                    <span className={styles.productCount}>
                      {count > 0 ? `${count} məhsul` : 'Kolleksiya'}
                    </span>
                  </div>
                </div>

                <div className={styles.arrowCircle}>
                  <ArrowRight size={16} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categories;
