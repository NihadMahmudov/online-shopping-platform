import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { Package, Clock, CheckCircle, Truck, MapPin, ArrowLeft } from 'lucide-react';
import AuthModal from '../../components/common/AuthModal/AuthModal';
import styles from './Orders.module.css';

const Orders = ({ inPanel = false }) => {
  const { user } = useAuth();
  const { getOrdersByUser } = useOrders();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(!user);
  const userOrders = getOrdersByUser(user?.email);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'Gözləmədə', color: '#f59e0b', icon: <Clock size={16} /> };
      case 'approved': return { label: 'Təsdiqləndi', color: '#3b82f6', icon: <CheckCircle size={16} /> };
      case 'shipped': return { label: 'Yoldadır', color: '#8b5cf6', icon: <Truck size={16} /> };
      case 'delivered': return { label: 'Çatdırıldı', color: '#10b981', icon: <Package size={16} /> };
      default: return { label: 'Bilinmir', color: '#6b7280', icon: <Clock size={16} /> };
    }
  };

  // If not logged in, show lock screen
  if (!user) {
    return (
      <>
        <div className={styles.emptyOrders}>
          <div className={styles.lockIcon}>🔒</div>
          <h2>Sifarişlərinizə baxmaq üçün daxil olun</h2>
          <p>Sifarişlərinizi izləmək və tarixçəni görmək üçün hesabınıza daxil olun.</p>
          <button className={styles.loginBtn} onClick={() => setShowAuthModal(true)}>
            Daxil Ol / Qeydiyyat
          </button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          message="Sifarişlərinizi görmək üçün daxil olun"
        />
      </>
    );
  }

  if (userOrders.length === 0) {
    return (
      <div className={styles.emptyOrders}>
        <Package size={48} className={styles.emptyIcon} />
        <h2>Hələ heç bir sifarişiniz yoxdur</h2>
        <p>Kataloqa daxil olaraq ilk sifarişinizi verə bilərsiniz.</p>
      </div>
    );
  }

  return (
    <div className={`${inPanel ? '' : 'container'} ${styles.ordersContainer} ${inPanel ? styles.inPanel : ''}`}>
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
      <h2 className={styles.pageTitle}>Sifarişlərim</h2>
      
      <div className={styles.ordersList}>
        {userOrders.map(order => {
          const statusInfo = getStatusInfo(order.status);
          
          return (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <span className={styles.orderId}>Sifariş #{order.id.slice(-6)}</span>
                  <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('az-AZ')}</span>
                </div>
                <div className={styles.orderStatus} style={{ backgroundColor: `${statusInfo.color}15`, color: statusInfo.color }}>
                  {statusInfo.icon} {statusInfo.label}
                </div>
              </div>

              {/* Status Progress Bar */}
              <div className={styles.progressTracker}>
                {['pending', 'approved', 'shipped', 'delivered'].map((step, index) => {
                  const steps = ['pending', 'approved', 'shipped', 'delivered'];
                  const currentIndex = steps.indexOf(order.status);
                  const isCompleted = index <= currentIndex;
                  const isActive = index === currentIndex;
                  
                  return (
                    <div key={step} className={`${styles.progressStep} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''}`}>
                      <div className={styles.stepDot}></div>
                      <span className={styles.stepLabel}>{getStatusInfo(step).label}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className={styles.orderItems}>
                {order.items.map((item, idx) => (
                  <div key={idx} className={styles.orderItem}>
                    <img src={item.img} alt={item.name} className={styles.itemImg} />
                    <div className={styles.itemDetails}>
                      <h4>{item.name}</h4>
                      <p>{item.price} AZN x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.deliveryInfo}>
                  <MapPin size={16} /> {order.address}
                </div>
                <div className={styles.orderTotal}>
                  <span>Cəmi:</span>
                  <strong>{order.total.toFixed(2)} AZN</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
