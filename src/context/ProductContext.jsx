import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';

const ProductContext = createContext();

const boutiqueStores = [
  { id: 'vogue_art', name: 'Vogue Art' },
  { id: 'modernist', name: 'Modernist' },
  { id: 'zarif_atelye', name: 'Zərif Atelye' },
  { id: 'style_lab', name: 'Style Lab' },
  { id: 'baku_closet', name: 'Baku Closet' },
  { id: 'silk_way', name: 'Silk Way' }
];

const trendingBoutiqueProducts = [
  {
    id: 101,
    name: 'İpək Köynək',
    category: 'accessories',
    price: 120,
    oldPrice: 160,
    rating: 4.9,
    reviews: 42,
    img: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=600',
    badge: 'Yeni',
    collections: ['flash', 'trend'],
    storeId: 'silk_way',
    storeName: 'Silk Way'
  },
  {
    id: 102,
    name: 'Klassik Şalvar',
    category: 'accessories',
    price: 85,
    oldPrice: 110,
    rating: 4.8,
    reviews: 29,
    img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=600',
    badge: 'Yeni',
    collections: ['trend'],
    storeId: 'vogue_art',
    storeName: 'Vogue Art'
  },
  {
    id: 103,
    name: 'Dəri Çanta',
    category: 'accessories',
    price: 245,
    oldPrice: 295,
    rating: 5.0,
    reviews: 58,
    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600',
    badge: 'Yeni',
    collections: ['trend'],
    storeId: 'baku_closet',
    storeName: 'Baku Closet'
  },
  {
    id: 104,
    name: 'Yun Jaket',
    category: 'accessories',
    price: 155,
    oldPrice: 195,
    rating: 4.7,
    reviews: 18,
    img: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0ec6?auto=format&fit=crop&q=80&w=600',
    badge: 'Yeni',
    collections: ['trend'],
    storeId: 'modernist',
    storeName: 'Modernist'
  }
];

const mappedInitial = initialProducts.map((p, index) => {
  const store = boutiqueStores[index % boutiqueStores.length];
  return {
    ...p,
    storeId: store.id,
    storeName: store.name
  };
});

// Add storeId='bame_demo' to initial demo products so they still show up
const demoProducts = [...trendingBoutiqueProducts, ...mappedInitial];
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    // Always start with demoProducts
    return demoProducts;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('atlas_categories');
    return saved ? JSON.parse(saved) : [
      { id: 'all', label: 'Hamısı', img: '' },
      { id: 'decor', label: 'Dekor', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80' },
      { id: 'accessories', label: 'Aksesuar', img: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cf4?auto=format&fit=crop&q=80' },
      { id: 'jewelry', label: 'Zərgərlik', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80' },
      { id: 'candles', label: 'Şamlar', img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80' },
      { id: 'sets', label: 'Hədiyyə Dəstləri', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80' }
    ];
  });

  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem('atlas_badges');
    return saved ? JSON.parse(saved) : ['Yeni', 'Bestseller', 'Endirim', 'Məhdud Sayda'];
  });

  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem('atlas_collections');
    return saved ? JSON.parse(saved) : [
      { id: 'flash', label: 'Flaş Məhsullar' },
      { id: 'bestseller', label: 'Çox Satılanlar' },
      { id: 'discount', label: 'Endirimli Məhsullar' },
      { id: 'coupon', label: 'Kuponlu Məhsullar' }
    ];
  });

  const [flashSale, setFlashSale] = useState(() => {
    const saved = localStorage.getItem('atlas_flash_sale');
    return saved ? JSON.parse(saved) : {
      targetDate: new Date(new Date().setHours(23, 59, 59)).toISOString(),
      productIds: []
    };
  });

  const [stories, setStories] = useState(() => {
    const saved = localStorage.getItem('atlas_stories');
    return saved ? JSON.parse(saved) : [
      { id: 1, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80', label: 'Yeni Gələnlər' },
      { id: 2, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80', label: 'Endirimlər' },
      { id: 3, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80', label: 'Hədiyyəlik' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('atlas_products', JSON.stringify(products));
    localStorage.setItem('atlas_categories', JSON.stringify(categories));
    localStorage.setItem('atlas_badges', JSON.stringify(badges));
    localStorage.setItem('atlas_collections', JSON.stringify(collections));
    localStorage.setItem('atlas_flash_sale', JSON.stringify(flashSale));
    localStorage.setItem('atlas_stories', JSON.stringify(stories));
  }, [products, categories, badges, collections, flashSale, stories]);

  // ── Products ────────────────────────────────────────────
  const addProduct = (product, storeId = null, storeName = null) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      reviews: 0,
      rating: 5,
      comments: [],
      storeId: storeId || 'bame_demo',
      storeName: storeName || 'AtlasMall',
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const updateProduct = (id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  // Filter by storeId for vendor dashboards
  const getProductsByStore = (storeId) => products.filter(p => p.storeId === storeId);

  // ── Categories ──────────────────────────────────────────
  const addCategory = (label) => {
    const newCat = { id: label.toLowerCase().replace(/\s+/g, '-'), label, img: '' };
    setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id));

  const updateCategoryImage = (id, img) =>
    setCategories(prev => prev.map(c => c.id === id ? { ...c, img } : c));

  // ── Badges ──────────────────────────────────────────────
  const addBadge = (label) => setBadges(prev => [...prev, label]);
  const deleteBadge = (label) => setBadges(prev => prev.filter(b => b !== label));

  // ── Collections ─────────────────────────────────────────
  const addCollection = (label) => {
    const newColl = { id: label.toLowerCase().replace(/\s+/g, '-'), label };
    setCollections(prev => [...prev, newColl]);
  };
  const deleteCollection = (id) => setCollections(prev => prev.filter(c => c.id !== id));

  // ── Flash Sale ──────────────────────────────────────────
  const updateFlashSale = (data) => setFlashSale(prev => ({ ...prev, ...data }));

  // ── Comments ────────────────────────────────────────────
  const addComment = (productId, comment) => {
    const newComment = { ...comment, id: Date.now(), date: new Date().toLocaleDateString('az-AZ') };
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, comments: [newComment, ...(p.comments || [])], reviews: (p.reviews || 0) + 1 }
        : p
    ));
  };

  const deleteComment = (productId, commentId) => {
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId), reviews: Math.max(0, (p.reviews || 1) - 1) }
        : p
    ));
  };

  // ── Stories ─────────────────────────────────────────────
  const addStory = (img, label) => setStories(prev => [{ id: Date.now(), img, label }, ...prev]);
  const deleteStory = (id) => setStories(prev => prev.filter(s => s.id !== id));

  return (
    <ProductContext.Provider value={{
      products, addProduct, deleteProduct, updateProduct, getProductsByStore,
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
