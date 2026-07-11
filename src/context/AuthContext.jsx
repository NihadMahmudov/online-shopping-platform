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
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('atlas_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('atlas_users_db');
    if (saved) return JSON.parse(saved);
    const initial = [
      DEFAULT_SUPERADMIN,
      { name: 'Qonaq İstifadəçi', email: 'qonaq@atlasmall.az', password: 'qonaq123', role: 'user', createdAt: new Date().toISOString(), status: 'active' }
    ];
    localStorage.setItem('atlas_users_db', JSON.stringify(initial));
    return initial;
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
      storeCategory: category || 'Ümumi',
      status: 'pending',     // pending | approved | suspended
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
    const updated = users.map(u => u.email === email ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u);
    setUsers(updated);
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
