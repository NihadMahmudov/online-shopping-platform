import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Zap, 
  Tag, 
  TrendingUp, 
  Ticket, 
  ArrowDownCircle, 
  LayoutGrid 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import styles from './Categories.module.css';

const Categories = ({ inPanel = false }) => {
  const [activeTab, setActiveTab] = useState('kateqoriyalar');
  const navigate = useNavigate();
  const { categories, products, collections } = useProducts();

  // Map collections to sidebar tabs
  const sidebarTabs = [
    { id: 'kateqoriyalar', label: 'Kateqoriyalar', icon: <LayoutGrid size={18} /> },
    ...collections.map(c => ({
      id: c.id,
      label: c.label,
      icon: c.id === 'flash' ? <Zap size={18} /> : 
            c.id === 'discount' ? <Tag size={18} /> : 
            c.id === 'bestseller' ? <TrendingUp size={18} /> : 
            c.id === 'coupon' ? <Ticket size={18} /> : <ArrowDownCircle size={18} />
    }))
  ];

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
        {/* Left Sidebar */}
        <div className={styles.sidebar}>
          {sidebarTabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.sidebarItem} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className={styles.tabContent}
            >
              {activeTab === 'kateqoriyalar' ? (
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
                          src={cat.img || 'https://placehold.co/200x200/f5f0e8/D4AF37?text=' + cat.label} 
                          alt={cat.label} 
                        />
                        <div className={styles.cubeBadge}>📦</div>
                      </div>
                      <span className={styles.catName}>{cat.label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className={styles.specialProductsGrid}
                >
                  <div className={styles.tabHeader}>
                    <h2>{sidebarTabs.find(t => t.id === activeTab)?.label}</h2>
                    <p>Sizin üçün seçilmiş ən yaxşı təkliflər</p>
                  </div>
                  <div className={styles.grid}>
                    {products.filter(p => {
                      if (!p.collections) return false;
                      return p.collections.includes(activeTab);
                    }).map(product => (
                      <motion.div 
                        key={product.id} 
                        variants={itemVariants}
                        className={styles.productMiniCard}
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <div className={styles.miniImgWrapper}>
                          <img src={product.img} alt={product.name} />
                          {product.badge && <span className={styles.miniBadge}>{product.badge}</span>}
                        </div>
                        <div className={styles.miniInfo}>
                          <h4>{product.name}</h4>
                          <div className={styles.miniPrice}>
                            <span className={styles.currentPrice}>{product.price} AZN</span>
                            {product.oldPrice && <span className={styles.oldPrice}>{product.oldPrice} AZN</span>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Categories;
