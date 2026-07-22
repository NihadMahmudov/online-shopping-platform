import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Trash2, Minus, Plus, MapPin, Phone, ArrowLeft } from 'lucide-react';
import AuthModal from '../../components/common/AuthModal/AuthModal';
import styles from './Cart.module.css';

const Cart = ({ inPanel = false }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, finalTotal, discountAmount, applyPromoCode, removePromoCode, appliedPromo } = useCart();
  const { addOrder } = useOrders();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });

  const handleCheckout = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!address || !phone) {
      alert("Zəhmət olmasa ünvan və əlaqə nömrənizi daxil edin.");
      return;
    }

    const createdOrder = addOrder({
      userEmail: user.email,
      customerName: user.name,
      address,
      phone,
      items: cart,
      total: finalTotal,
      discount: discountAmount,
      promo: appliedPromo
    });

    // Notify Customer
    addNotification({
      userEmail: user.email,
      title: 'Sifarişiniz Göndərildi 🎉',
      message: `#${createdOrder.id} nömrəli sifarişiniz qəbul edildi. Tezliklə satıcılar tərəfindən təsdiqlənəcək.`,
      orderId: createdOrder.id,
      type: 'order_created'
    });

    // Notify EACH vendor for items belonging to their store
    const storeMap = {};
    cart.forEach(item => {
      const sId = item.storeId || 'default';
      if (!storeMap[sId]) storeMap[sId] = [];
      storeMap[sId].push(item);
    });

    Object.keys(storeMap).forEach(sId => {
      const storeItems = storeMap[sId];
      const itemsText = storeItems.map(i => `${i.name} (x${i.quantity})`).join(', ');
      addNotification({
        storeId: sId,
        title: 'Yeni Sifariş Daxil Oldu! 📦',
        message: `Müştəri: ${user.name} — #${createdOrder.id} (${storeItems.length} məhsul: ${itemsText})`,
        orderId: createdOrder.id,
        type: 'order_new'
      });
    });
    
    setOrderSuccess(true);
    clearCart();
    setTimeout(() => setOrderSuccess(false), 5000);
  };

  if (orderSuccess) {
    return (
      <div className={styles.emptyCart}>
        <div className={styles.successAnimation}>
          <h2>Təbriklər! 🎉</h2>
          <p>Sifarişiniz AtlasMall sisteminə göndərildi.</p>
          <p>Təsdiqləndikdən sonra "Sifarişlərim" bölməsindən izləyə bilərsiniz.</p>
          <button 
            className={styles.ordersBtn}
            onClick={() => navigate('/panel', { state: { activeTab: 'orders' } })}
          >
            Sifarişlərimə Bax
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Səbətiniz boşdur</h2>
        <p>Görünür hələ heç bir məhsul əlavə etməmisiniz.</p>
      </div>
    );
  }

  return (
    <div className={`${inPanel ? '' : 'container'} ${styles.cartContainer} ${inPanel ? styles.inPanel : ''}`}>
      {!inPanel && (
        <button 
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#D4AF37',
            cursor: 'pointer',
            padding: '8px 0',
            marginBottom: '15px',
            fontSize: '15px',
            fontWeight: 500,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.color = '#B4932F'}
          onMouseLeave={(e) => e.target.style.color = '#D4AF37'}
        >
          <ArrowLeft size={18} /> Geri Qayıt
        </button>
      )}
      <h1 className={styles.title}>Səbət</h1>
      
      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {cart.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <img src={item.img} alt={item.name} className={styles.itemImage} />
              <div className={styles.itemDetails}>
                <h3>{item.name}</h3>
                <p className={styles.itemPrice}>{item.price} ₼</p>
                <div className={styles.itemBottom}>
                  <div className={styles.quantityControls}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                  <p className={styles.itemTotal}>{(item.price * item.quantity).toFixed(2)} ₼</p>
                </div>
              </div>
              <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        
        <div className={styles.cartSummary}>
          <h2>Sifariş Xülasəsi</h2>
          <div className={styles.summaryRow}>
            <span>Məhsulların cəmi:</span>
            <span>{cartTotal.toFixed(2)} AZN</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Çatdırılma:</span>
            <span>0.00 AZN</span>
          </div>

          <div className={styles.promoSection}>
            <div className={styles.promoInputWrapper}>
              <input 
                type="text" 
                placeholder="Promo kod (Məs: ATLAS10)" 
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                disabled={!!appliedPromo}
              />
              {!appliedPromo ? (
                <button onClick={() => {
                  const res = applyPromoCode(promoInput);
                  setPromoMessage({ text: res.message, type: res.success ? 'success' : 'error' });
                }}>Tətbiq et</button>
              ) : (
                <button onClick={() => {
                  removePromoCode();
                  setPromoInput('');
                  setPromoMessage({ text: 'Promo kod silindi', type: 'info' });
                }} className={styles.removePromoBtn}>Sil</button>
              )}
            </div>
            {promoMessage.text && (
              <p className={`${styles.promoMessage} ${styles[promoMessage.type]}`}>{promoMessage.text}</p>
            )}
          </div>

          {discountAmount > 0 && (
            <div className={`${styles.summaryRow} ${styles.discountRow}`}>
              <span>Endirim ({appliedPromo}):</span>
              <span>-{discountAmount.toFixed(2)} AZN</span>
            </div>
          )}

          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Yekun məbləğ:</span>
            <span>{finalTotal.toFixed(2)} AZN</span>
          </div>

          <div className={styles.checkoutForm}>
            <h3>Çatdırılma Məlumatları</h3>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <MapPin size={18} />
                <input 
                  type="text" 
                  placeholder="Çatdırılma ünvanı (Məs: 28 May m/s)" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <Phone size={18} />
                <input 
                  type="text" 
                  placeholder="WhatsApp nömrəniz (+994...)" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <button className={styles.checkoutBtn} onClick={handleCheckout}>Sifarişi Tamamla</button>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={(success) => setShowAuthModal(false)}
        message="Sifariş vermək üçün hesabınıza daxil olun"
      />
    </div>
  );
};

export default Cart;
