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
    return parsed;
  });

  // Fetch fresh users list from backend (Neon DB) on mount
  useEffect(() => {
    const fetchUsersFromDb = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const dbUsers = await res.json();
          if (Array.isArray(dbUsers) && dbUsers.length > 0) {
            setUsers(dbUsers);
            localStorage.setItem('atlas_users_db', JSON.stringify(dbUsers));
            
            // Sync current user session status if logged in
            setUser(currentUser => {
              if (currentUser?.email) {
                const freshUser = dbUsers.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
                if (freshUser) {
                  return { ...currentUser, ...freshUser };
                }
              }
              return currentUser;
            });
          }
        }
      } catch (err) {
        console.error("Error fetching users from Neon DB:", err);
      }
    };
    fetchUsersFromDb();
  }, []);

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
  const register = async (name, email, password) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return { error: 'Bu email artıq qeydiyyatdan keçib.' };

    const newUserPayload = {
      name, email: email.toLowerCase(), password,
      role: 'user',
      status: 'active'
    };

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Qeydiyyat zamanı xəta baş verdi.' };
      }
      const createdUser = { ...data, password };
      setUsers(prev => [createdUser, ...prev]);
      setUser(createdUser);
      return { user: createdUser };
    } catch (err) {
      console.error('Register API error:', err);
      const fallbackUser = { ...newUserPayload, createdAt: new Date().toISOString() };
      setUsers(prev => [fallbackUser, ...prev]);
      setUser(fallbackUser);
      return { user: fallbackUser };
    }
  };

  // ── Vendor Register ────────────────────────────────────
  const registerVendor = async (storeName, email, password, phone, category) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return { error: 'Bu email artıq qeydiyyatdan keçib.' };

    const storeId = `store_${Date.now()}`;
    const vendorPayload = {
      name: storeName,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'vendor',
      storeId,
      storeName,
      storeCategory: category || 'Geyim & Moda',
      status: 'pending'
    };

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Qeydiyyat zamanı xəta baş verdi.' };
      }
      const createdVendor = { ...data, password };
      setUsers(prev => [createdVendor, ...prev]);
      setUser(createdVendor);
      return { user: createdVendor };
    } catch (err) {
      console.error('Register vendor error:', err);
      const fallbackVendor = { ...vendorPayload, createdAt: new Date().toISOString() };
      setUsers(prev => [fallbackVendor, ...prev]);
      setUser(fallbackVendor);
      return { user: fallbackVendor };
    }
  };

  // ── Login ──────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Giriş uğursuz oldu.' };
      }
      setUser(data);
      return { user: data };
    } catch (err) {
      console.error('Login API error, checking local fallback:', err);
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) return { error: 'E-poçt və ya şifrə yanlışdır.' };
      if (found.status === 'suspended') return { error: 'Bu hesab dondurulmuşdur. Ətraflı məlumat üçün AtlasMall ilə əlaqə saxlayın.' };
      setUser(found);
      return { user: found };
    }
  };

  const logout = () => setUser(null);

  // ── Email Verification (Resend) ───────────────────────
  const sendVerificationCode = async (email) => {
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Kod göndərilərkən xəta baş verdi.' };
      }
      return data;
    } catch (err) {
      console.error('Send code error:', err);
      return { error: 'Serverlə əlaqə kəsildi.' };
    }
  };

  const verifyEmailCode = async (email, code) => {
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Kod yanlışdır.' };
      }
      return data;
    } catch (err) {
      console.error('Verify code error:', err);
      return { error: 'Serverlə əlaqə kəsildi.' };
    }
  };

  // ── User Management (SuperAdmin) ───────────────────────
  const deleteUser = async (email) => {
    if (email === DEFAULT_SUPERADMIN.email) return;
    setUsers(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
    if (user?.email?.toLowerCase() === email.toLowerCase()) setUser(null);

    try {
      await fetch(`/api/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete user API error:', err);
    }
  };

  const updateUserStatusInDb = async (email, status) => {
    try {
      await fetch('/api/users/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status })
      });
    } catch (err) {
      console.error('Update status API error:', err);
    }
  };

  const suspendUser = (email) => {
    if (email === DEFAULT_SUPERADMIN.email) return;
    let nextStatus = 'suspended';
    setUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const isActive = u.status === 'suspended';
        nextStatus = isActive ? (u.role === 'vendor' ? 'approved' : 'active') : 'suspended';
        return { ...u, status: nextStatus };
      }
      return u;
    }));

    updateUserStatusInDb(email, nextStatus);

    if (user?.email?.toLowerCase() === email.toLowerCase()) {
      setUser(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const approveVendor = (email) => {
    setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, status: 'approved' } : u));
    updateUserStatusInDb(email, 'approved');
    if (user?.email?.toLowerCase() === email.toLowerCase()) {
      setUser(prev => prev ? { ...prev, status: 'approved' } : null);
    }
  };

  const rejectVendor = (email) => {
    setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, status: 'rejected' } : u));
    updateUserStatusInDb(email, 'rejected');
  };

  // ── Role helpers ───────────────────────────────────────
  const isSuperAdmin = user?.role === 'superadmin';
  const isVendor = user?.role === 'vendor';
  const isUser = user?.role === 'user';
  const isAdmin = isSuperAdmin;

  const vendors = users.filter(u => u.role === 'vendor');
  const customers = users.filter(u => u.role === 'user');
  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const approvedVendors = vendors.filter(v => v.status === 'approved');

  return (
    <AuthContext.Provider value={{
      user, users, customers, vendors, pendingVendors, approvedVendors,
      register, registerVendor, login, logout,
      sendVerificationCode, verifyEmailCode,
      deleteUser, suspendUser, approveVendor, rejectVendor,
      isSuperAdmin, isVendor, isUser, isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

