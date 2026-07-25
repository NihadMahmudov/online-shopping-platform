import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import RecentlyViewed from '../../components/home/RecentlyViewed';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import AuthModal from '../../components/common/AuthModal/AuthModal';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, addComment } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [commentForm, setCommentForm] = useState({ rating: 0, text: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [showCommentSuccess, setShowCommentSuccess] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, message: '', action: null });

  const categoryLabel = categories.find(c => c.id === product?.category)?.label || product?.category;

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

  const handleAddToCart = () => {
    requireAuth('Məhsulu səbətə əlavə etmək üçün daxil olun', () => {
      addToCart({ ...product, quantity });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    });
  };

  const handleOrderNow = () => {
    requireAuth('Sifariş vermək üçün daxil olun', () => {
      addToCart({ ...product, quantity });
      navigate('/cart');
    });
  };

  const handleWishlist = () => {
    requireAuth('Məhsulu bəyəndiklərə əlavə etmək üçün daxil olun', () => {
      toggleWishlist(product);
    });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentForm.text.trim()) return;

    requireAuth('Rəy bildirmək üçün daxil olun', () => {
      const reviewerName = user?.name || user?.email?.split('@')[0] || 'İstifadəçi';
      addComment(product.id, {
        name: reviewerName,
        rating: commentForm.rating || 5,
        text: commentForm.text.trim()
      });
      setCommentForm({ rating: 0, text: '' });
      setHoverRating(0);
      setShowCommentSuccess(true);
      setTimeout(() => setShowCommentSuccess(false), 3000);
    });
  };

  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setLoading(true);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const timer = setTimeout(() => {
      const foundProduct = products.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
        
        const saved = localStorage.getItem('atlas_recent');
        let ids = saved ? JSON.parse(saved) : [];
        ids = [foundProduct.id, ...ids.filter(i => i !== foundProduct.id)].slice(0, 10);
        localStorage.setItem('atlas_recent', JSON.stringify(ids));
      } else {
        setProduct(null);
      }
      setLoading(false);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 450); // Sleek transition delay
    return () => clearTimeout(timer);
  }, [id, products]);

  if (loading) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonInfo}>
            <div className={styles.skeletonLineShort} />
            <div className={styles.skeletonLineLong} />
            <div className={styles.skeletonLineMedium} />
            <div className={styles.skeletonLinePrice} />
            <div className={styles.skeletonLineText} />
            <div className={styles.skeletonActions} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.loading}>
        <p>Məhsul yüklənir və ya tapılmadı...</p>
        <button onClick={() => navigate('/shop')}>Mağazaya Qayıt</button>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  
  const commentsList = product.comments || [];
  const reviewsCount = commentsList.length > 0 ? commentsList.length : (product.reviews || 0);
  const hasReviews = reviewsCount > 0;

  let effectiveRating = 0;
  if (commentsList.length > 0) {
    const sum = commentsList.reduce((acc, c) => acc + Number(c.rating || 5), 0);
    effectiveRating = Number((sum / commentsList.length).toFixed(1));
  } else if (product.reviews > 0 && product.rating) {
    effectiveRating = Number(product.rating);
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(user ? '/panel' : '/');
    }
  };

  return (
    <>
      <motion.div 
        className={`container ${styles.page}`}
        initial={{ opacity: 0, y: 15, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      >
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeft size={20} /> Geri Qayıt
        </button>

        <div className={styles.productGrid}>
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <img src={product.img} alt={product.name} />
              {product.badge && <span className={styles.badge}>{product.badge}</span>}
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.metaRow}>
              <span className={styles.category}>{categoryLabel}</span>
              <span className={styles.metaSeparator}>•</span>
              <Link to={`/store/${product.storeId}`} className={styles.sellerLink}>
                Satıcı: <strong>{product.storeName || 'AtlasMall'}</strong>
              </Link>
            </div>
            <h1 className={styles.title}>{product.name}</h1>

            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={hasReviews && i < Math.round(effectiveRating) ? "var(--primary)" : "none"} 
                    color={hasReviews && i < Math.round(effectiveRating) ? "var(--primary)" : "var(--border)"} 
                  />
                ))}
              </div>
              <span className={styles.reviews}>
                {hasReviews ? `${effectiveRating} (${reviewsCount} Rəy)` : "Hələ rəy yazılmayıb"}
              </span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>{product.price} AZN</span>
              {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                <span className={styles.oldPrice}>{product.oldPrice} AZN</span>
              )}
            </div>

            <p className={styles.description}>
              {product.description || "Bu məhsul AtlasMall tərəfindən xüsusi olaraq seçilmişdir."}
            </p>

            <div className={styles.actions}>
              <div className={styles.topActions}>
                <div className={styles.quantity}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                <button className={`${styles.addToCart} ${added ? styles.added : ''}`} onClick={handleAddToCart}>
                  <ShoppingCart size={20} /> {added ? 'Əlavə edildi!' : 'Səbətə At'}
                </button>
                <button className={`${styles.wishlist} ${isLiked ? styles.active : ''}`} onClick={handleWishlist}>
                  <Heart size={24} fill={isLiked ? "var(--error)" : "none"} color={isLiked ? "var(--error)" : "currentColor"} />
                </button>
              </div>
              <button className={styles.orderNow} onClick={handleOrderNow}>Sifariş Et</button>
            </div>

            <div className={styles.features}>
              <div className={styles.featureItem}><Truck size={20} /> <span>Sürətli Çatdırılma</span></div>
              <div className={styles.featureItem}><ShieldCheck size={20} /> <span>100% Keyfiyyət Zəmanəti</span></div>
              <div className={styles.featureItem}><RotateCcw size={20} /> <span>Rahat Qaytarılma</span></div>
            </div>
          </div>
        </div>

        <div className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <h2>Müştəri Rəyləri</h2>
            <div className={styles.ratingOverview}>
              <div className={styles.bigRating}>{hasReviews ? effectiveRating : '0.0'}</div>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    fill={hasReviews && i < Math.round(effectiveRating) ? "var(--primary)" : "none"} 
                    color={hasReviews && i < Math.round(effectiveRating) ? "var(--primary)" : "var(--border)"} 
                  />
                ))}
              </div>
              <span>{hasReviews ? `${reviewsCount} rəy` : "Hələ rəy yoxdur"}</span>
            </div>
          </div>

          <div className={styles.reviewsGrid}>
            <div className={styles.commentFormBox}>
              <h3>Rəy Bildir</h3>
              {isRealUser ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '8px', fontWeight: 500 }}>
                  Rəy yazan: <strong style={{ color: 'var(--primary)' }}>{user.name || user.email}</strong>
                </p>
              ) : (
                <div style={{
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  color: 'var(--text)',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span>🔒 Rəy bildirmək üçün qeydiyyatdan keçin</span>
                  <button 
                    type="button" 
                    onClick={() => requireAuth('Rəy bildirmək üçün qeydiyyatdan keçin və ya daxil olun', () => {})}
                    style={{
                      background: 'var(--primary)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Qeydiyyat / Daxil Ol
                  </button>
                </div>
              )}
              {showCommentSuccess && <div className={styles.successNote}>Təşəkkür edirik! Rəyiniz əlavə edildi.</div>}
              <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                <div className={styles.starSelector}>
                  {[1, 2, 3, 4, 5].map(num => {
                    const activeRating = hoverRating || commentForm.rating;
                    return (
                      <button 
                        key={num} 
                        type="button" 
                        onClick={() => {
                          if (!isRealUser) {
                            requireAuth('Rəy bildirmək üçün qeydiyyatdan keçin və ya daxil olun', () => {
                              setCommentForm(prev => ({ ...prev, rating: num }));
                            });
                          } else {
                            setCommentForm(prev => ({ ...prev, rating: num }));
                          }
                        }}
                        onMouseEnter={() => setHoverRating(num)}
                        onMouseLeave={() => setHoverRating(0)}
                        title={`${num} Ulduz`}
                      >
                        <Star 
                          size={24} 
                          fill={activeRating >= num ? "var(--primary)" : "none"} 
                          color={activeRating >= num ? "var(--primary)" : "var(--border)"} 
                        />
                      </button>
                    );
                  })}
                </div>
                <textarea 
                  required 
                  rows="4" 
                  value={commentForm.text} 
                  onChange={e => setCommentForm({ ...commentForm, text: e.target.value })} 
                  placeholder="Rəyiniz..."
                  onFocus={() => {
                    if (!isRealUser) {
                      requireAuth('Rəy bildirmək üçün qeydiyyatdan keçin və ya daxil olun', () => {});
                    }
                  }}
                ></textarea>
                <button type="submit" className={styles.submitComment}>Rəyi Göndər</button>
              </form>
            </div>

            <div className={styles.commentsList}>
              {product.comments?.map(comment => (
                <div key={comment.id} className={styles.commentItem}>
                  <div className={styles.commentMeta}>
                    <div className={styles.userAvatar}>{comment.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <h4 className={styles.userName}>{comment.name}</h4>
                      <div className={styles.itemStars}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < comment.rating ? "var(--primary)" : "none"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className={styles.commentText}>{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className={styles.relatedSection}>
            <h2>Oxşar Məhsullar</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        <RecentlyViewed noContainer={true} />
      </motion.div>

      <AuthModal
        isOpen={authModal.open}
        onClose={handleAuthClose}
        message={authModal.message}
      />
    </>
  );
};

export default ProductDetail;
