import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bame_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('bame_users_db');
    const initialUsers = saved ? JSON.parse(saved) : [
      { name: 'Admin', email: 'bame@gmail.com', password: 'admin', role: 'admin' },
      { name: 'Qonaq', email: 'qonaq@bame.az', password: 'qonaq', role: 'user' }
    ];
    if (!saved) localStorage.setItem('bame_users_db', JSON.stringify(initialUsers));
    return initialUsers;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('bame_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bame_user');
    }
  }, [user]);

  const register = (name, email, password) => {
    const existing = users.find(u => u.email === email);
    if (existing) return { error: 'Bu email artıq qeydiyyatdan keçib.' };

    const role = email === 'bame@gmail.com' ? 'admin' : 'user';
    const newUser = { name, email, password, role };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('bame_users_db', JSON.stringify(updatedUsers));
    
    setUser(newUser);
    return { user: newUser };
  };

  const login = (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (!foundUser) return { error: 'E-poçt və ya şifrə yanlışdır.' };

    setUser(foundUser);
    return { user: foundUser };
  };

  const logout = () => setUser(null);

  const deleteUser = (email) => {
    if (email === 'bame@gmail.com') return; // Qoruma (Master Admin silinə bilməz)
    const updatedUsers = users.filter(u => u.email !== email);
    setUsers(updatedUsers);
    localStorage.setItem('bame_users_db', JSON.stringify(updatedUsers));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, users, register, login, logout, isAdmin, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
