import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const getCartForUser = (user) => {
  const isRealUser = Boolean(user && user.email && user.email !== 'qonaq@atlasmall.az');
  if (!isRealUser) return [];
  const cartKey = `atlas_cart_${user.email.toLowerCase().trim()}`;
  try {
    const saved = localStorage.getItem(cartKey);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userEmail = user?.email || '';

  const isRealUser = Boolean(user && user.email && user.email !== 'qonaq@atlasmall.az');
  const cartKey = isRealUser ? `atlas_cart_${user.email.toLowerCase().trim()}` : null;

  const [cart, setCart] = useState(() => getCartForUser(user));
  const [prevEmail, setPrevEmail] = useState(userEmail);
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  if (prevEmail !== userEmail) {
    setPrevEmail(userEmail);
    setCart(getCartForUser(user));
  }

  // Remove legacy global key if exists
  useEffect(() => {
    try {
      if (localStorage.getItem('atlas_cart')) {
        localStorage.removeItem('atlas_cart');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const applyPromoCode = (code) => {
    if (code.toUpperCase() === 'ATLAS10') {
      setDiscount(0.10);
      setAppliedPromo(code.toUpperCase());
      return { success: true, message: 'Promo kod tətbiq edildi!' };
    }
    return { success: false, message: 'Yanlış və ya vaxtı keçmiş kod.' };
  };

  const removePromoCode = () => {
    setDiscount(0);
    setAppliedPromo('');
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, { ...product, quantity: 1 }];
      }

      if (isRealUser && cartKey) {
        try {
          localStorage.setItem(cartKey, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (isRealUser && cartKey) {
        try {
          localStorage.setItem(cartKey, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, quantity } : item));
      if (isRealUser && cartKey) {
        try {
          localStorage.setItem(cartKey, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (isRealUser && cartKey) {
      try {
        localStorage.removeItem(cartKey);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const discountAmount = cartTotal * discount;
  const finalTotal = cartTotal - discountAmount;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartItemCount,
      applyPromoCode,
      removePromoCode,
      appliedPromo,
      discountAmount,
      finalTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
