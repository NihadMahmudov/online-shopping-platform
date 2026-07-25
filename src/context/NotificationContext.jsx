import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchNotificationsFromApi,
  sendBroadcastNotificationApi,
  sendNotificationApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  clearNotificationsApi
} from '../services/api';

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

  // Fetch from Neon PostgreSQL
  const loadNotificationsFromApi = useCallback(async (userEmail, storeId, isSuperAdmin, role) => {
    try {
      const dbNotifs = await fetchNotificationsFromApi({ userEmail, storeId, isSuperAdmin, role });
      if (Array.isArray(dbNotifs) && dbNotifs.length > 0) {
        setNotifications(prev => {
          // Merge dbNotifs with local state to avoid duplicates
          const dbMap = new Map();
          dbNotifs.forEach(n => dbMap.set(String(n.id), n));
          
          prev.forEach(n => {
            if (!dbMap.has(String(n.id))) {
              dbMap.set(String(n.id), n);
            }
          });

          const merged = Array.from(dbMap.values()).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          localStorage.setItem('atlas_notifications_db', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (e) {
      console.warn('Failed to load notifications from API:', e);
    }
  }, []);

  // Poll notifications from API every 10 seconds
  useEffect(() => {
    const savedUser = localStorage.getItem('atlas_user');
    let currentUser = null;
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
      } catch (e) {
        console.warn('Failed to parse user from localStorage:', e);
      }
    }

    const email = currentUser?.email;
    const storeId = currentUser?.storeId;
    const isSuperAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.isSuperAdmin;
    const role = currentUser?.role || 'user';

    // Delay initial load slightly or run inside timeout to avoid sync setState in effect render phase
    const timer = setTimeout(() => {
      loadNotificationsFromApi(email, storeId, isSuperAdmin, role);
    }, 0);

    const interval = setInterval(() => {
      loadNotificationsFromApi(email, storeId, isSuperAdmin, role);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [loadNotificationsFromApi]);

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

  const addNotification = async ({ userEmail, storeId, title, message, orderId, sender = null, type = 'info' }) => {
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

    // Async push to Neon DB
    try {
      await sendNotificationApi({
        userEmail: userEmail || null,
        storeId: storeId || null,
        title,
        message,
        sender: newNotif.sender
      });
    } catch (e) {
      console.warn('Failed to push notification to DB:', e);
    }

    return newNotif;
  };

  const broadcastNotification = async ({ targetGroup = 'all', title, message, sender = '👑 AtlasMall SuperAdmin' }) => {
    // 1. Local update for immediate UI feedback
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

    // 2. Persistent update in Neon PostgreSQL Database!
    try {
      const apiRes = await sendBroadcastNotificationApi({ targetGroup, title, message, sender });
      console.log('✅ Broadcast saved to Neon PostgreSQL:', apiRes);
    } catch (e) {
      console.error('❌ Error sending broadcast to Neon DB:', e);
    }

    return newNotifs.length || 1;
  };

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await markNotificationReadApi(id);
    } catch (e) {
      console.warn('Failed to mark read on API:', e);
    }
  };

  const markAllAsRead = async (userEmail, storeId, isSuperAdmin) => {
    setNotifications(prev => prev.map(n => {
      let isForUser = false;
      if (isSuperAdmin) isForUser = true;
      else if (storeId && n.storeId === storeId) isForUser = true;
      else if (userEmail && n.userEmail === userEmail) isForUser = true;

      return isForUser ? { ...n, read: true } : n;
    }));
    try {
      await markAllNotificationsReadApi({ userEmail, storeId, isSuperAdmin });
    } catch (e) {
      console.warn('Failed to mark all read on API:', e);
    }
  };

  const clearNotifications = async (userEmail, storeId, isSuperAdmin) => {
    setNotifications(prev => prev.filter(n => {
      if (isSuperAdmin) return false;
      if (storeId && n.storeId === storeId) return false;
      if (userEmail && n.userEmail === userEmail) return false;
      return true;
    }));
    try {
      await clearNotificationsApi({ userEmail, storeId, isSuperAdmin });
    } catch (e) {
      console.warn('Failed to clear notifications on API:', e);
    }
  };

  const getFilteredNotifications = (userEmail, storeId, isSuperAdmin) => {
    return notifications.filter(n => {
      if (isSuperAdmin) return true; // Superadmin sees all notifications
      if (storeId && n.storeId === storeId) return true; // Vendor sees store notifications
      if (userEmail && n.userEmail === userEmail) return true; // Customer sees user notifications
      if (n.isGlobal) return true; // Global notifications
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
      getUnreadCount,
      refreshNotifications: loadNotificationsFromApi
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
