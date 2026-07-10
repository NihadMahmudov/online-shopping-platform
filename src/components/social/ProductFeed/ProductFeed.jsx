import React from 'react';
import ProductCard from './ProductCard';
import styles from './ProductFeed.module.css';

const products = [
  {
    id: 1,
    name: 'Qızılı Dekorativ Vaz',
    description: 'Evinizə zəriflik qatacaq əl işi dekorativ vaz.',
    price: 45,
    likes: 245,
    img: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Premium Şam Dəsti',
    description: 'Sakitləşdirici aromalı, təbii tərkibli şamlar.',
    price: 32,
    likes: 189,
    img: 'https://images.unsplash.com/photo-1603006375271-7f3b904bb90c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Zərif Hədiyyə Qutusu',
    description: 'İçərisində ən sevilən aksesuarların olduğu özəl qutu.',
    price: 65,
    likes: 412,
    img: 'https://images.unsplash.com/photo-1549465220-1d8c9d9c6769?q=80&w=600&auto=format&fit=crop'
  }
];

const ProductFeed = () => {
  return (
    <section className={styles.feed}>
      <div className="container">
        <h2 className={styles.feedTitle}>Sənin üçün Kəşf Edilənlər</h2>
        <div className={styles.posts}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductFeed;
