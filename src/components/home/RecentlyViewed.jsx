import React, { useEffect, useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../common/ProductCard/ProductCard';
import styles from './RecentlyViewed.module.css';

const RecentlyViewed = () => {
  const { products } = useProducts();
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('bame_recent');
    if (saved) {
      const ids = JSON.parse(saved);
      const filtered = ids
        .map(id => products.find(p => p.id === id))
        .filter(p => p !== undefined)
        .slice(0, 8);
      setRecentProducts(filtered);
    }
  }, [products]);

  if (recentProducts.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.bgDecor}></div>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Sizin baxdıqlarınız</h2>
            <p className={styles.subtitle}>Gözünüzdən qaçmayan hədiyyələr.</p>
          </div>
        </div>
        <div className={styles.scrollContainer}>
          <div className={styles.scrollGrid}>
            {recentProducts.map(product => (
              <div key={product.id} className={styles.itemWrapper}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
