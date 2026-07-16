import React, { useEffect, useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../common/ProductCard/ProductCard';
import styles from './RecentlyViewed.module.css';

const RecentlyViewed = ({ noContainer = false }) => {
  const { products } = useProducts();

  const recentProducts = React.useMemo(() => {
    const saved = localStorage.getItem('atlas_recent');
    if (saved) {
      const ids = JSON.parse(saved);
      return ids
        .map(id => products.find(p => p.id === id))
        .filter(p => p !== undefined)
        .slice(0, 8);
    }
    return [];
  }, [products]);

  if (recentProducts.length === 0) return null;

  const content = (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>Sizin baxdıqlarınız</h2>
      </div>
      <div className={styles.scrollGrid}>
        {recentProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );

  return (
    <section className={styles.section}>
      {noContainer ? content : <div className="container">{content}</div>}
    </section>
  );
};

export default RecentlyViewed;
