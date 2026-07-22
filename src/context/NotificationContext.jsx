import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('atlas_notifications_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Initial sample notifications for demonstration
    return [
      {
        id: 'notif-1',
        storeId: 'vogue_art',
        title: 'Xoş gəldiniz! 🛍️',
        message: 'AtlasMall mağaza paneliniz aktivdir. Yeni sifarişləriniz burada görünəcək.',
        type: 'system',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'notif-2',
        userEmail: 'qonaq@atlasmall.az',
        title: 'Sifarişiniz Yoldadır 🚚',
        message: '#ORD-1784178819888 nömrəli sifarişinizin çatdırılmasına başlanıldı.',
        type: 'order_status',
        read: false,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('atlas_notifications_db', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('atlas_notifications_db');
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {
          console.warn('Failed to parse notifications storage:', e);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addNotification = ({ userEmail, storeId, title, message, orderId, sender = null, type = 'info' }) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userEmail: userEmail || null,
      storeId: storeId || null,
      sender: sender || (storeId ? `📦 ${storeId.toUpperCase()} Mağazası` : '🔔 AtlasMall Sistem'),
      title,
      message,
      orderId: orderId || null,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const broadcastNotification = ({ targetGroup = 'all', title, message, sender = '👑 AtlasMall SuperAdmin' }) => {
    const savedUsers = localStorage.getItem('atlas_users_db');
    let usersList = savedUsers ? JSON.parse(savedUsers) : [];

    const newNotifs = [];
    const timestamp = new Date().toISOString();

    usersList.forEach(u => {
      let matches = false;
      if (targetGroup === 'all') matches = true;
      else if (targetGroup === 'customers' && u.role === 'user') matches = true;
      else if (targetGroup === 'vendors' && u.role === 'vendor') matches = true;

      if (matches) {
        newNotifs.push({
          id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          userEmail: u.email,
          storeId: u.storeId || null,
          sender: sender,
          title,
          message,
          type: 'broadcast',
          read: false,
          createdAt: timestamp
        });
      }
    });

    setNotifications(prev => [...newNotifs, ...prev]);
    return newNotifs.length;
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = (userEmail, storeId, isSuperAdmin) => {
    setNotifications(prev => prev.map(n => {
      let isForUser = false;
      if (isSuperAdmin) isForUser = true;
      else if (storeId && n.storeId === storeId) isForUser = true;
      else if (userEmail && n.userEmail === userEmail) isForUser = true;

      return isForUser ? { ...n, read: true } : n;
    }));
  };

  const clearNotifications = (userEmail, storeId, isSuperAdmin) => {
    setNotifications(prev => prev.filter(n => {
      if (isSuperAdmin) return false;
      if (storeId && n.storeId === storeId) return false;
      if (userEmail && n.userEmail === userEmail) return false;
      return true;
    }));
  };

  const getFilteredNotifications = (userEmail, storeId, isSuperAdmin) => {
    return notifications.filter(n => {
      if (isSuperAdmin) return true; // Superadmin sees all notifications
      if (storeId && n.storeId === storeId) return true; // Vendor sees store notifications
      if (userEmail && n.userEmail === userEmail) return true; // Customer sees user notifications
      return false;
    });
  };

  const getUnreadCount = (userEmail, storeId, isSuperAdmin) => {
    return getFilteredNotifications(userEmail, storeId, isSuperAdmin).filter(n => !n.read).length;
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      broadcastNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      getFilteredNotifications,
      getUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
