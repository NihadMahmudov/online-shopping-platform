import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../common/ProductCard/ProductCard';
import CountdownTimer from '../common/CountdownTimer/CountdownTimer';
import styles from './FlashSale.module.css';

const FlashSale = () => {
  const { products, flashSale } = useProducts();
  
  // Admin tərəfindən seçilmiş məhsulları tapırıq
  const flashSaleProducts = products.filter(p => flashSale.productIds.includes(p.id));

  if (flashSaleProducts.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.badge}>
              <Zap size={14} fill="currentColor" />
              FLAŞ SATIŞ
            </div>
            <h2 className={styles.title}>Günün Təklifləri</h2>
            <p className={styles.subtitle}>Yalnız bu günə özəl şok endirimlər!</p>
          </div>
          
          <CountdownTimer targetDate={flashSale.targetDate} />
        </div>

        <div className={styles.grid}>
          {flashSaleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
