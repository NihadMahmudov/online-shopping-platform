import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, ShoppingCart, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth } from '../../../context/AuthContext';
import AuthModal from '../../common/AuthModal/AuthModal';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [likes, setLikes] = useState(product.likes || 124);
  const isLiked = isInWishlist(product.id);
  const [authModal, setAuthModal] = useState({ open: false, message: '', action: null });

  const isRealUser = user && user.email !== 'qonaq@atlasmall.az';

  const requireAuth = (message, action) => {
    if (isRealUser) {
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

  const handleLike = () => {
    requireAuth('Bəyəndiklərə əlavə etmək üçün daxil olun', () => {
      toggleWishlist(product);
      setLikes(isLiked ? likes - 1 : likes + 1);
    });
  };

  const handleAddToCart = () => {
    requireAuth('Səbətə əlavə etmək üçün daxil olun', () => {
      addToCart(product);
    });
  };

  return (
    <>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className={styles.header}>
          <div className={styles.avatar}>A</div>
          <div className={styles.userInfo}>
            <span className={styles.username}>atlasmall</span>
            <span className={styles.location}>Mingəçevir, Azərbaycan</span>
          </div>
        </div>

        <div className={styles.imageWrapper}>
          <img src={product.img} alt={product.name} />
        </div>

        <div className={styles.actions}>
          <div className={styles.leftActions}>
            <button onClick={handleLike} className={isLiked ? styles.liked : ''}>
              <Heart size={24} fill={isLiked ? "var(--error)" : "none"} color={isLiked ? "var(--error)" : "currentColor"} />
            </button>
            <button><MessageCircle size={24} /></button>
            <button><Share2 size={24} /></button>
          </div>
          <button onClick={handleLike}><Bookmark size={24} fill={isLiked ? "currentColor" : "none"} /></button>
        </div>

        <div className={styles.info}>
          <span className={styles.likesCount}>{likes} bəyənmə</span>
          <p className={styles.caption}>
            <strong>{product.name}</strong> — {product.description}
          </p>
          <div className={styles.footer}>
            <span className={styles.price}>{product.price} AZN</span>
            <button className={styles.addToCart} onClick={handleAddToCart}>
              <ShoppingCart size={18} /> Səbətə At
            </button>
          </div>
        </div>
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
