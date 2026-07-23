import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';
import { fetchProductsFromApi, createProductApi, deleteProductApi, uploadImageToCloudinary } from '../services/api';

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
    const saved = localStorage.getItem('atlas_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to load products from localStorage", e);
      }
    }
    return demoProducts;
  });

  const defaultCategoriesList = [
    { id: 'all', label: 'Hamısı', name: 'Hamısı', img: '' },
    { id: 'women', label: 'Qadın Geyimləri', name: 'Qadın Geyimləri', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80' },
    { id: 'men', label: 'Kişi Geyimləri', name: 'Kişi Geyimləri', img: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80' },
    { id: 'kids', label: 'Uşaq Geyimləri', name: 'Uşaq Geyimləri', img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80' },
    { id: 'shoes', label: 'Ayaqqabı & Çanta', name: 'Ayaqqabı & Çanta', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80' },
    { id: 'accessories', label: 'Aksesuar & Saat', name: 'Aksesuar & Saat', img: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cf4?auto=format&fit=crop&q=80' },
    { id: 'jewelry', label: 'Zərgərlik', name: 'Zərgərlik', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80' },
    { id: 'beauty', label: 'Kosmetika & Qulluq', name: 'Kosmetika & Qulluq', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80' },
    { id: 'decor', label: 'Ev & Dekor', name: 'Ev & Dekor', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80' },
    { id: 'candles', label: 'Şamlar', name: 'Şamlar', img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80' },
    { id: 'sets', label: 'Hədiyyə Dəstləri', name: 'Hədiyyə Dəstləri', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80' },
    { id: 'electronics', label: 'Elektronika', name: 'Elektronika', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80' }
  ];

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('atlas_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped = parsed.map(c => ({
            ...c,
            label: c.label || c.name || c.id,
            name: c.name || c.label || c.id
          }));
          // Merge defaults if missing
          const existingIds = new Set(mapped.map(c => c.id));
          const missing = defaultCategoriesList.filter(d => !existingIds.has(d.id));
          return [...mapped, ...missing];
        }
      } catch (e) {
        console.warn('Failed to parse categories storage:', e);
      }
    }
    return defaultCategoriesList;
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

  const [showcaseCards, setShowcaseCards] = useState(() => {
    const saved = localStorage.getItem('atlas_showcase_cards');
    return saved ? JSON.parse(saved) : [
      {
        id: 'main',
        title: 'Yeni Mövsüm',
        subtitle: 'Kolleksiyanı kəşf et',
        img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
        link: '/shop',
        type: 'main'
      },
      {
        id: 'decor',
        title: 'Dekor',
        subtitle: 'Kəşf et',
        img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
        link: '/shop?category=decor',
        type: 'right'
      },
      {
        id: 'jewelry',
        title: 'Zərgərlik',
        subtitle: 'Kəşf et',
        img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600',
        link: '/shop?category=jewelry',
        type: 'right'
      },
      {
        id: 'accessories',
        title: 'Aksesuar',
        subtitle: 'Kəşf et',
        img: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cf4?auto=format&fit=crop&q=80&w=600',
        link: '/shop?category=accessories',
        type: 'right'
      },
      {
        id: 'candles',
        title: 'Şamlar',
        subtitle: 'Kəşf et',
        img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600',
        link: '/shop?category=candles',
        type: 'right'
      },
      {
        id: 'shoes',
        title: 'Ayaqqabı',
        subtitle: 'Kəşf et',
        img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
        link: '/shop?category=shoes',
        type: 'bottom'
      },
      {
        id: 'sets',
        title: 'Hədiyyə Dəstləri',
        subtitle: 'Kəşf et',
        img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600',
        link: '/shop?category=sets',
        type: 'bottom'
      },
      {
        id: 'collections',
        title: 'Kolleksiyalar',
        subtitle: 'Kəşf et',
        img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
        link: '/shop?collection=trend',
        type: 'bottom'
      }
    ];
  });

  // Sync with Neon PostgreSQL backend on mount
  useEffect(() => {
    let isMounted = true;
    fetchProductsFromApi()
      .then(apiProducts => {
        if (isMounted && Array.isArray(apiProducts) && apiProducts.length > 0) {
          setProducts(apiProducts);
        }
      })
      .catch(err => console.warn('Product sync from API failed, using cached state:', err));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem('atlas_products', JSON.stringify(products));
    localStorage.setItem('atlas_categories', JSON.stringify(categories));
    localStorage.setItem('atlas_badges', JSON.stringify(badges));
    localStorage.setItem('atlas_collections', JSON.stringify(collections));
    localStorage.setItem('atlas_flash_sale', JSON.stringify(flashSale));
    localStorage.setItem('atlas_stories', JSON.stringify(stories));
    localStorage.setItem('atlas_showcase_cards', JSON.stringify(showcaseCards));
  }, [products, categories, badges, collections, flashSale, stories, showcaseCards]);

  // ── Products ────────────────────────────────────────────
  const addProduct = async (product, storeId = null, storeName = null) => {
    let imageUrl = product.img;

    // If image is a File or base64 data URL, upload to Cloudinary first
    if (product.imageFile || (typeof product.img === 'string' && product.img.startsWith('data:'))) {
      try {
        const uploadResult = await uploadImageToCloudinary(
          product.imageFile || product.img,
          'atlasmall_products'
        );
        if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      } catch (err) {
        console.warn('Cloudinary upload fallback to current image:', err);
      }
    }

    const newProductData = {
      name: product.name,
      category: product.category || 'all',
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
      img: imageUrl,
      badge: product.badge || 'Yeni',
      collections: product.collections || ['flash'],
      storeId: storeId || product.storeId || 'bame_demo',
      storeName: storeName || product.storeName || 'AtlasMall',
      description: product.description || '',
      stock: product.stock ? Number(product.stock) : 10
    };

    try {
      // Create product in Neon PostgreSQL
      const createdApiProduct = await createProductApi(newProductData);
      const newProduct = {
        ...newProductData,
        ...createdApiProduct,
        comments: []
      };
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      console.warn('Backend product creation failed, creating locally:', err);
      const localProduct = {
        ...newProductData,
        id: Date.now(),
        reviews: 0,
        rating: 5,
        comments: [],
        createdAt: new Date().toISOString()
      };
      setProducts(prev => [localProduct, ...prev]);
      return localProduct;
    }
  };

  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await deleteProductApi(id);
    } catch (e) {
      console.warn('Backend product delete error:', e);
    }
  };

  const updateProduct = (id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  // Filter by storeId for vendor dashboards
  const getProductsByStore = (storeId) => products.filter(p => p.storeId === storeId);

  // ── Categories ──────────────────────────────────────────
  const addCategory = (label, storeId = null) => {
    const cleanLabel = label.trim();
    const generatedId = storeId 
      ? `${storeId}_${cleanLabel.toLowerCase().replace(/\s+/g, '-')}` 
      : cleanLabel.toLowerCase().replace(/\s+/g, '-');
    
    // Check if category already exists
    const newCat = { id: generatedId, label: cleanLabel, name: cleanLabel, img: '', storeId };
    setCategories(prev => {
      if (prev.some(c => c.id === generatedId)) return prev;
      return [...prev, newCat];
    });
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

  // ── Showcase Cards ──────────────────────────────────────
  const updateShowcaseCard = (id, data) => {
    setShowcaseCards(prev => prev.map(card => card.id === id ? { ...card, ...data } : card));
  };

  return (
    <ProductContext.Provider value={{
      products, addProduct, deleteProduct, updateProduct, getProductsByStore,
      categories, addCategory, deleteCategory, updateCategoryImage,
      badges, addBadge, deleteBadge,
      collections, addCollection, deleteCollection,
      flashSale, updateFlashSale,
      addComment, deleteComment,
      stories, addStory, deleteStory,
      showcaseCards, updateShowcaseCard
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
