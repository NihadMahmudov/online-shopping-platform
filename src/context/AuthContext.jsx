import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEFAULT_SUPERADMIN = {
  name: 'AtlasMall Admin',
  email: 'atlas@admin.com',
  password: 'admin123',
  role: 'superadmin',
  createdAt: new Date().toISOString(),
  status: 'active'
};

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('atlas_users_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: If any vendor has status 'active' (due to previous bug), convert to 'approved'
        return parsed.map(u => {
          if (u.role === 'vendor' && u.status === 'active') {
            return { ...u, status: 'approved' };
          }
          return u;
        });
      } catch (e) {
        console.error("Failed to parse users db", e);
      }
    }
    const initial = [
      DEFAULT_SUPERADMIN,
      { name: 'Qonaq İstifadəçi', email: 'qonaq@atlasmall.az', password: 'qonaq123', role: 'user', createdAt: new Date().toISOString(), status: 'active' },
      { name: 'Vogue Art', email: 'vogue@bame.az', password: 'vogue', role: 'vendor', storeId: 'vogue_art', storeName: 'Vogue Art', storeCategory: 'Premium', phone: '+994 50 111 22 33', status: 'approved', createdAt: new Date().toISOString() },
      { name: 'Modernist', email: 'modernist@bame.az', password: 'modernist', role: 'vendor', storeId: 'modernist', storeName: 'Modernist', storeCategory: 'Müasir', phone: '+994 51 222 33 44', status: 'approved', createdAt: new Date().toISOString() },
      { name: 'Zərif Atelye', email: 'zarif@bame.az', password: 'zarif', role: 'vendor', storeId: 'zarif_atelye', storeName: 'Zərif Atelye', storeCategory: 'Əl işi', phone: '+994 55 333 44 55', status: 'approved', createdAt: new Date().toISOString() },
      { name: 'Style Lab', email: 'style@bame.az', password: 'style', role: 'vendor', storeId: 'style_lab', storeName: 'Style Lab', storeCategory: 'Dəb', phone: '+994 70 444 55 66', status: 'approved', createdAt: new Date().toISOString() },
      { name: 'Baku Closet', email: 'closet@bame.az', password: 'closet', role: 'vendor', storeId: 'baku_closet', storeName: 'Baku Closet', storeCategory: 'Vintage', phone: '+994 99 555 66 77', status: 'approved', createdAt: new Date().toISOString() },
      { name: 'Silk Way', email: 'silk@bame.az', password: 'silk', role: 'vendor', storeId: 'silk_way', storeName: 'Silk Way', storeCategory: 'İpək', phone: '+994 12 400 90 90', status: 'approved', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('atlas_users_db', JSON.stringify(initial));
    return initial;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('atlas_user');
    if (!saved) return null;
    let parsed = JSON.parse(saved);
    if (parsed && parsed.role === 'vendor' && parsed.status === 'active') {
      parsed.status = 'approved';
    }
    // Retrieve fresher record from users database if exists
    const savedDb = localStorage.getItem('atlas_users_db');
    if (savedDb) {
      try {
        const dbUsers = JSON.parse(savedDb);
        const fresh = dbUsers.find(u => u.email === parsed.email);
        if (fresh) {
          if (fresh.role === 'vendor' && fresh.status === 'active') {
            return { ...fresh, status: 'approved' };
          }
          return fresh;
        }
      } catch (e) {
        console.error("Error parsing users db:", e);
      }
    }
    return parsed;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('atlas_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('atlas_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('atlas_users_db', JSON.stringify(users));
  }, [users]);

  // ── Customer Register ──────────────────────────────────
  const register = (name, email, password) => {
    const existing = users.find(u => u.email === email);
    if (existing) return { error: 'Bu email artıq qeydiyyatdan keçib.' };
    const newUser = {
      name, email, password,
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    const updated = [...users, newUser];
    setUsers(updated);
    setUser(newUser);
    return { user: newUser };
  };

  // ── Vendor Register ────────────────────────────────────
  const registerVendor = (storeName, email, password, phone, category) => {
    const existing = users.find(u => u.email === email);
    if (existing) return { error: 'Bu email artıq qeydiyyatdan keçib.' };
    const storeId = `store_${Date.now()}`;
    const newVendor = {
      name: storeName,
      email, password, phone,
      role: 'vendor',
      storeId,
      storeName,
      storeCategory: category || 'Geyim & Moda',
      status: 'pending',     // must be approved by superadmin before accessing dashboard
      createdAt: new Date().toISOString()
    };
    const updated = [...users, newVendor];
    setUsers(updated);
    setUser(newVendor);
    return { user: newVendor };
  };

  // ── Login ──────────────────────────────────────────────
  const login = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { error: 'E-poçt və ya şifrə yanlışdır.' };
    if (found.status === 'suspended') return { error: 'Bu hesab dondurulmuşdur. Ətraflı məlumat üçün AtlasMall ilə əlaqə saxlayın.' };
    setUser(found);
    return { user: found };
  };

  const logout = () => setUser(null);

  // ── User Management (SuperAdmin) ───────────────────────
  const deleteUser = (email) => {
    if (email === DEFAULT_SUPERADMIN.email) return;
    const updated = users.filter(u => u.email !== email);
    setUsers(updated);
    if (user?.email === email) setUser(null);
  };

  const suspendUser = (email) => {
    if (email === DEFAULT_SUPERADMIN.email) return;
    const updated = users.map(u => {
      if (u.email === email) {
        const isActive = u.status === 'suspended';
        const nextStatus = isActive ? (u.role === 'vendor' ? 'approved' : 'active') : 'suspended';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    
    // Also update logged-in session user if they are the one affected
    if (user?.email === email) {
      const updatedUser = updated.find(u => u.email === email);
      setUser(updatedUser);
    }
  };

  const approveVendor = (email) => {
    const updated = users.map(u => u.email === email ? { ...u, status: 'approved' } : u);
    setUsers(updated);
    // If currently logged in vendor gets approved, update session
    if (user?.email === email) {
      const approvedUser = updated.find(u => u.email === email);
      setUser(approvedUser);
    }
  };

  const rejectVendor = (email) => {
    const updated = users.map(u => u.email === email ? { ...u, status: 'rejected' } : u);
    setUsers(updated);
  };

  // ── Role helpers ───────────────────────────────────────
  const isSuperAdmin = user?.role === 'superadmin';
  const isVendor = user?.role === 'vendor';
  const isUser = user?.role === 'user';
  const isAdmin = isSuperAdmin; // backward compat

  const vendors = users.filter(u => u.role === 'vendor');
  const customers = users.filter(u => u.role === 'user');
  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const approvedVendors = vendors.filter(v => v.status === 'approved');

  return (
    <AuthContext.Provider value={{
      user, users, customers, vendors, pendingVendors, approvedVendors,
      register, registerVendor, login, logout,
      deleteUser, suspendUser, approveVendor, rejectVendor,
      isSuperAdmin, isVendor, isUser, isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
