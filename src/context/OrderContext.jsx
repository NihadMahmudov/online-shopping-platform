import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchOrdersFromApi, createOrderApi, updateOrderStatusApi } from '../services/api';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('atlas_orders_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Load orders from Neon PostgreSQL API
  const loadOrdersFromApi = useCallback(async () => {
    try {
      const dbOrders = await fetchOrdersFromApi({ isSuperAdmin: true });
      if (Array.isArray(dbOrders)) {
        setOrders(prev => {
          const dbMap = new Map();
          dbOrders.forEach(o => dbMap.set(String(o.id), o));

          // Preserve local orders that might not have synced yet
          prev.forEach(o => {
            if (!dbMap.has(String(o.id))) {
              dbMap.set(String(o.id), o);
            }
          });

          const merged = Array.from(dbMap.values()).sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
          localStorage.setItem('atlas_orders_db', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.warn('Failed to load orders from API:', e);
    }
  }, []);

  // Poll orders every 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrdersFromApi();
    }, 0);

    const interval = setInterval(() => {
      loadOrdersFromApi();
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [loadOrdersFromApi]);

  useEffect(() => {
    localStorage.setItem('atlas_orders_db', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('atlas_orders_db');
      if (saved) {
        try {
          setOrders(JSON.parse(saved));
        } catch (e) {
          console.warn('Failed to parse orders storage:', e);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addOrder = (orderData) => {
    const orderId = orderData.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      ...orderData,
      id: orderId,
      status: orderData.status || 'pending',
      createdAt: orderData.createdAt || new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);

    // Save to Neon PostgreSQL asynchronously
    createOrderApi(newOrder).catch(err => {
      console.warn('Failed to persist order to Neon DB:', err);
    });

    return newOrder;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
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

    // Update in Neon PostgreSQL asynchronously
    try {
      await updateOrderStatusApi(orderId, newStatus);
    } catch (err) {
      console.warn('Failed to update order status in Neon DB:', err);
    }

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

  const getOrdersByUser = (userEmail) => {
    if (!userEmail) return [];
    const clean = userEmail.toLowerCase().trim();
    return orders.filter(o => o.userEmail && o.userEmail.toLowerCase().trim() === clean);
  };

  // Filter orders for a specific store (for vendor dashboard)
  const getOrdersByStore = (storeId) => orders.filter(o => {
    if (o.storeId === storeId) return true;
    if (!o.items || !Array.isArray(o.items)) return false;
    return o.items.some(item => item.storeId === storeId);
  });

  // Platform-wide analytics
  const getTotalRevenue = () => orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);

  const getRevenueByStore = (storeId) => {
    return getOrdersByStore(storeId)
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => {
        const storeItems = (o.items || []).filter(i => i.storeId === storeId);
        const storeTotal = storeItems.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);
        return sum + storeTotal;
      }, 0);
  };

  return (
    <OrderContext.Provider value={{
      orders, addOrder, updateOrderStatus,
      getOrdersByUser, getOrdersByStore,
      getTotalRevenue, getRevenueByStore,
      refreshOrders: loadOrdersFromApi
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
