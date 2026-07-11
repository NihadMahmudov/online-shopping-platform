import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth } from '../../../context/AuthContext';
import AuthModal from '../AuthModal/AuthModal';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const isLiked = isInWishlist(product.id);
  const [added, setAdded] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, message: '', action: null });

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const requireAuth = (message, action) => {
    if (user) {
      action();
    } else {
      setAuthModal({ open: true, message, action });
    }
  };

  const handleAuthClose = (success) => {
    if (success && authModal.action) {
      authModal.action();
    }
    setAuthModal({ open: false, message: '', action: null });
  };

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    requireAuth('Məhsulu səbətə əlavə etmək üçün daxil olun', () => {
      addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    });
  };

  const handleWishlist = (e) => {
    e?.stopPropagation();
    requireAuth('Məhsulu bəyəndiklərə əlavə etmək üçün daxil olun', () => {
      toggleWishlist(product);
    });
  };

  return (
    <>
      <motion.div
        className={styles.card}
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
      >
        {/* ─── Image Section ─── */}
        <div className={styles.imageWrapper}>
          <Link to={`/product/${product.id}`} tabIndex={-1}>
            <img
              src={product.img}
              alt={product.name}
              loading="lazy"
              onError={e => {
                e.target.style.display = 'none';
                e.target.parentNode.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e8e0d5 100%)';
              }}
            />
          </Link>

          {/* Top Badge */}
          {product.badge && (
            <span className={styles.topBadge}>
              {product.badge === 'Bestseller' ? '🏆 Ən çox satılan' : product.badge === 'Yeni' ? '✨ Yeni' : product.badge}
            </span>
          )}

          {/* Wishlist Button */}
          <button
            className={`${styles.wishlistBtn} ${isLiked ? styles.wishlisted : ''}`}
            onClick={handleWishlist}
            aria-label={isLiked ? 'Bəyəndiklərdən çıxart' : 'Bəyəndiklərə əlavə et'}
          >
            <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
          </button>

          {/* Desktop Hover Quick-Add */}
          <div className={styles.quickAdd}>
            <button
              className={`${styles.quickAddBtn} ${added ? styles.added : ''}`}
              onClick={handleAddToCart}
            >
              {added ? <Check size={15} /> : <ShoppingCart size={15} />}
              {added ? 'Əlavə edildi!' : 'Səbətə At'}
            </button>
          </div>
        </div>

        {/* ─── Info Section ─── */}
        <div className={styles.cardBody}>
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <h3 className={styles.name}>{product.name}</h3>
          </Link>

          <Link to={`/store/${product.storeId}`} className={styles.storeLink}>
            🏪 {product.storeName || 'AtlasMall'}
          </Link>

          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'}
                  color={i < Math.floor(product.rating) ? '#f59e0b' : '#d1d5db'}
                />
              ))}
            </div>
            <span className={styles.reviewCount}>({product.reviews})</span>
          </div>

          <div className={styles.priceContainer}>
            <div className={styles.priceRow}>
              {discountPercent && (
                <span className={styles.discountBadge}>-{discountPercent}%</span>
              )}
              <span className={styles.price}>{product.price} ₼</span>
              {product.oldPrice && (
                <span className={styles.oldPrice}>{product.oldPrice} ₼</span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Add Button */}
        <button
          className={`${styles.mobileAddBtn} ${added ? styles.mobileAdded : ''}`}
          onClick={handleAddToCart}
          aria-label="Səbətə əlavə et"
        >
          {added ? <Check size={15} /> : <ShoppingCart size={15} />}
          {added ? 'Əlavə edildi!' : 'Səbətə At'}
        </button>
      </motion.div>

      <AuthModal
        isOpen={authModal.open}
        onClose={handleAuthClose}
        message={authModal.message}
      />
    </>
  );
};

export default ProductCard;
