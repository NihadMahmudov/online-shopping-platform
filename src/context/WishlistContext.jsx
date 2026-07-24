import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const getWishlistForUser = (user) => {
  const isRealUser = Boolean(user && user.email && user.email !== 'qonaq@atlasmall.az');
  if (!isRealUser) return [];
  const userKey = `atlas_wishlist_${user.email.toLowerCase().trim()}`;
  try {
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const userEmail = user?.email || '';

  const isRealUser = Boolean(user && user.email && user.email !== 'qonaq@atlasmall.az');
  const userKey = isRealUser ? `atlas_wishlist_${user.email.toLowerCase().trim()}` : null;

  const [wishlist, setWishlist] = useState(() => getWishlistForUser(user));
  const [prevEmail, setPrevEmail] = useState(userEmail);

  if (prevEmail !== userEmail) {
    setPrevEmail(userEmail);
    setWishlist(getWishlistForUser(user));
  }

  // Clean up legacy global 'atlas_wishlist' key so guest/unauthenticated users don't see previous likes
  useEffect(() => {
    try {
      if (localStorage.getItem('atlas_wishlist')) {
        localStorage.removeItem('atlas_wishlist');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleWishlist = (product) => {
    if (!isRealUser || !userKey) return;

    setWishlist((prev) => {
      const isSaved = prev.some((item) => item.id === product.id);
      const updated = isSaved
        ? prev.filter((item) => item.id !== product.id)
        : [...prev, product];

      try {
        localStorage.setItem(userKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save wishlist', e);
      }
      return updated;
    });
  };

  const isInWishlist = (id) => {
    if (!isRealUser) return false;
    return wishlist.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
