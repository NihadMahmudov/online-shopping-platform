import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('bame_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('bame_categories');
    return saved ? JSON.parse(saved) : [
      { id: 'all', label: 'Hamısı', img: '' },
      { id: 'decor', label: 'Dekor', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80' },
      { id: 'accessories', label: 'Aksesuar', img: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cf4?auto=format&fit=crop&q=80' },
      { id: 'toys', label: 'Oyuncaq', img: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&q=80' },
      { id: 'jewelry', label: 'Qızıl/Gümüş', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80' }
    ];
  });

  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem('bame_badges');
    return saved ? JSON.parse(saved) : ['Yeni', 'Bestseller', 'Endirim', 'Məhdud Sayda'];
  });

  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem('bame_collections');
    return saved ? JSON.parse(saved) : [
      { id: 'summer', label: 'Yaz Kolleksiyası' },
      { id: 'premium', label: 'Premium Hədiyyələr' }
    ];
  });

  const [flashSale, setFlashSale] = useState(() => {
    const saved = localStorage.getItem('bame_flash_sale');
    return saved ? JSON.parse(saved) : {
      targetDate: new Date(new Date().setHours(23, 59, 59)).toISOString(),
      productIds: []
    };
  });

  const [stories, setStories] = useState(() => {
    const saved = localStorage.getItem('bame_stories');
    return saved ? JSON.parse(saved) : [
      { id: 1, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80', label: 'Yeni Gələnlər' },
      { id: 2, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80', label: 'Endirimlər' },
      { id: 3, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80', label: 'Hədiyyəlik' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('bame_products', JSON.stringify(products));
    localStorage.setItem('bame_categories', JSON.stringify(categories));
    localStorage.setItem('bame_badges', JSON.stringify(badges));
    localStorage.setItem('bame_collections', JSON.stringify(collections));
    localStorage.setItem('bame_flash_sale', JSON.stringify(flashSale));
    localStorage.setItem('bame_stories', JSON.stringify(stories));
  }, [products, categories, badges, collections, flashSale, stories]);

  const addProduct = (product) => {
    const newProduct = { ...product, id: Date.now(), reviews: 0, rating: 5, comments: [] };
    setProducts([...products, newProduct]);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addCategory = (label) => {
    const newCat = { id: label.toLowerCase().replace(/\s+/g, '-'), label, img: '' };
    setCategories([...categories, newCat]);
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const updateCategoryImage = (id, img) => {
    setCategories(categories.map(c => c.id === id ? { ...c, img } : c));
  };

  const addBadge = (label) => setBadges([...badges, label]);
  const deleteBadge = (label) => setBadges(badges.filter(b => b !== label));

  const addCollection = (label) => {
    const newColl = { id: label.toLowerCase().replace(/\s+/g, '-'), label };
    setCollections([...collections, newColl]);
  };

  const deleteCollection = (id) => setCollections(collections.filter(c => c.id !== id));

  const updateFlashSale = (data) => setFlashSale(prev => ({ ...prev, ...data }));

  const addComment = (productId, comment) => {
    const newComment = {
      ...comment,
      id: Date.now(),
      date: new Date().toLocaleDateString('az-AZ'),
    };
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, comments: [newComment, ...(p.comments || [])], reviews: (p.reviews || 0) + 1 } 
        : p
    ));
  };

  const deleteComment = (productId, commentId) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { 
            ...p, 
            comments: (p.comments || []).filter(c => c.id !== commentId), 
            reviews: Math.max(0, (p.reviews || 1) - 1) 
          } 
        : p
    ));
  };

  const addStory = (img, label) => {
    const newStory = { id: Date.now(), img, label };
    setStories(prev => [newStory, ...prev]);
  };

  const deleteStory = (id) => setStories(prev => prev.filter(s => s.id !== id));

  return (
    <ProductContext.Provider value={{ 
      products, addProduct, deleteProduct, 
      categories, addCategory, deleteCategory, updateCategoryImage,
      badges, addBadge, deleteBadge,
      collections, addCollection, deleteCollection,
      flashSale, updateFlashSale,
      addComment, deleteComment,
      stories, addStory, deleteStory
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
