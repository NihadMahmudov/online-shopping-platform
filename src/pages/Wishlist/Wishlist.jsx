import React, { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import AuthModal from '../../components/common/AuthModal/AuthModal';
import styles from './Wishlist.module.css';

const Wishlist = ({ inPanel = false }) => {
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(!user);

  // If not logged in, show AuthModal immediately
  if (!user) {
    return (
      <>
        <div className={styles.emptyWishlist}>
          <div className={styles.lockIcon}>🔒</div>
          <h2>Bəyəndiklərinizə baxmaq üçün daxil olun</h2>
          <p>Bəyəndiyiniz məhsulları gördükdən sonra buraya əlavə edin.</p>
          <button className={styles.loginBtn} onClick={() => setShowAuthModal(true)}>
            Daxil Ol / Qeydiyyat
          </button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          message="Bəyəndiklərinizi görmək üçün daxil olun"
        />
      </>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className={styles.emptyWishlist}>
        <div className={styles.emptyIcon}>💝</div>
        <h2>İstək siyahınız boşdur</h2>
        <p>Bəyəndiyiniz məhsulları bura əlavə edərək daha sonra baxa bilərsiniz.</p>
      </div>
    );
  }

  return (
    <div className={`${inPanel ? '' : 'container'} ${styles.wishlistContainer} ${inPanel ? styles.inPanel : ''}`}>
      <h1 className={styles.title}>Bəyəndiklərim</h1>

      <div className={styles.grid}>
        {wishlist.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
