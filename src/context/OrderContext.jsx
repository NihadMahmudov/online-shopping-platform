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
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
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
