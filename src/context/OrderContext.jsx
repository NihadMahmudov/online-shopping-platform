import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('atlas_orders_db');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('atlas_orders_db', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order) => {
    const newOrder = {
      ...order,
      id: `ORD-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    let updatedUserEmail = null;
    let statusLabel = newStatus;
    if (newStatus === 'approved') statusLabel = 'Təsdiqləndi ✅';
    else if (newStatus === 'shipped') statusLabel = 'Yoldadır 🚚';
    else if (newStatus === 'delivered') statusLabel = 'Çatdırıldı 🎁';
    else if (newStatus === 'cancelled') statusLabel = 'Ləğv edildi ❌';
    else if (newStatus === 'pending') statusLabel = 'Gözləmədə ⏳';

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        updatedUserEmail = o.userEmail;
        return { ...o, status: newStatus };
      }
      return o;
    }));

    if (updatedUserEmail) {
      try {
        const savedNotifs = localStorage.getItem('atlas_notifications_db');
        let notifs = savedNotifs ? JSON.parse(savedNotifs) : [];
        notifs.unshift({
          id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userEmail: updatedUserEmail,
          title: 'Sifariş Statusu Yeniləndi 🚚',
          message: `#${orderId} nömrəli sifarişinizin yeni statusu: "${statusLabel}"`,
          orderId: orderId,
          type: 'order_status',
          read: false,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('atlas_notifications_db', JSON.stringify(notifs));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Notification save error', err);
      }
    }
  };

  const getOrdersByUser = (userEmail) => orders.filter(o => o.userEmail === userEmail);

  // Filter orders for a specific store (for vendor dashboard)
  const getOrdersByStore = (storeId) => orders.filter(o => {
    if (!o.items) return false;
    return o.items.some(item => item.storeId === storeId);
  });

  // Platform-wide analytics
  const getTotalRevenue = () => orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const getRevenueByStore = (storeId) => {
    return getOrdersByStore(storeId)
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => {
        const storeItems = (o.items || []).filter(i => i.storeId === storeId);
        const storeTotal = storeItems.reduce((s, i) => s + (i.price * i.quantity), 0);
        return sum + storeTotal;
      }, 0);
  };

  return (
    <OrderContext.Provider value={{
      orders, addOrder, updateOrderStatus,
      getOrdersByUser, getOrdersByStore,
      getTotalRevenue, getRevenueByStore
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
