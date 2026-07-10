import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('bame_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  useEffect(() => {
    localStorage.setItem('bame_cart', JSON.stringify(cart));
  }, [cart]);

  const applyPromoCode = (code) => {
    // Simple mock promo code logic
    if (code.toUpperCase() === 'BAME10') {
      setDiscount(0.10); // 10% endirim
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
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
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
