export const collections = [
  { id: 'flash', label: 'Flaş Məhsullar' },
  { id: 'bestseller', label: 'Çox Satılanlar' },
  { id: 'discount', label: 'Endirimli Məhsullar' },
  { id: 'coupon', label: 'Kuponlu Məhsullar' }
];

export const badges = ['Yeni', 'Bestseller', 'Endirim'];

export const categories = [
  { id: 'all', label: 'Hamısı', img: '' },
  { id: 'decor', label: 'Dekor', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop' },
  { id: 'jewelry', label: 'Zərgərlik', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop' },
  { id: 'candles', label: 'Şamlar', img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1974&auto=format&fit=crop' },
  { id: 'accessories', label: 'Aksesuarlar', img: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?q=80&w=1974&auto=format&fit=crop' },
  { id: 'sets', label: 'Hədiyyə Dəstləri', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2030&auto=format&fit=crop' },
];

export const products = [
  {
    id: 1,
    name: 'Zərif Mirvari Sırğalar',
    category: 'jewelry',
    price: 55,
    oldPrice: 75,
    rating: 4.8,
    reviews: 124,
    img: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&q=80&auto=format&fit=crop',
    badge: 'Yeni',
    collections: ['flash', 'new']
  },
  {
    id: 2,
    name: 'Premium Aromalı Şam Dəsti',
    category: 'candles',
    price: 38,
    oldPrice: null,
    rating: 4.9,
    reviews: 89,
    img: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&q=80&auto=format&fit=crop',
    badge: 'Bestseller',
    collections: ['bestseller', 'flash']
  },
  {
    id: 3,
    name: 'Qızılı Dekorativ Vaz',
    category: 'decor',
    price: 62,
    oldPrice: 80,
    rating: 4.7,
    reviews: 56,
    img: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80&auto=format&fit=crop',
    badge: 'Endirim',
    collections: ['discount', 'coupon']
  },
  {
    id: 4,
    name: 'Gümüş Bilərzik',
    category: 'jewelry',
    price: 45,
    oldPrice: null,
    rating: 4.6,
    reviews: 203,
    img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80&auto=format&fit=crop',
    badge: null,
    collections: ['discount']
  },
  {
    id: 5,
    name: 'Lüks Hədiyyə Qutusu',
    category: 'sets',
    price: 89,
    oldPrice: 110,
    rating: 5.0,
    reviews: 312,
    img: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600&q=80&auto=format&fit=crop',
    badge: 'Bestseller',
    collections: ['bestseller', 'coupon']
  },
  {
    id: 6,
    name: 'Əl işi Taxta Çərçivə',
    category: 'decor',
    price: 28,
    oldPrice: null,
    rating: 4.5,
    reviews: 67,
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80&auto=format&fit=crop',
    badge: null,
    collections: []
  },
  {
    id: 7,
    name: 'Ətirli Diffuser Dəsti',
    category: 'candles',
    price: 42,
    oldPrice: 55,
    rating: 4.8,
    reviews: 145,
    img: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80&auto=format&fit=crop',
    badge: 'Endirim',
    collections: ['discount', 'flash']
  },
  {
    id: 8,
    name: 'Zərif İpək Əşarfı',
    category: 'accessories',
    price: 35,
    oldPrice: null,
    rating: 4.7,
    reviews: 98,
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&auto=format&fit=crop',
    badge: 'Yeni',
    collections: ['flash']
  },
  {
    id: 9,
    name: 'Dəri Cüzdan (Hədiyyə)',
    category: 'accessories',
    price: 75,
    oldPrice: 95,
    rating: 4.9,
    reviews: 178,
    img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80&auto=format&fit=crop',
    badge: 'Endirim',
    collections: ['discount', 'coupon']
  },
  {
    id: 10,
    name: 'Çiçəkli Hədiyyə Dəsti',
    category: 'sets',
    price: 95,
    oldPrice: null,
    rating: 4.8,
    reviews: 241,
    img: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&q=80&auto=format&fit=crop',
    badge: 'Yeni',
    collections: ['flash', 'coupon']
  },
  {
    id: 11,
    name: 'Minimalist Saat',
    category: 'accessories',
    price: 120,
    oldPrice: 150,
    rating: 4.9,
    reviews: 89,
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&auto=format&fit=crop',
    badge: 'Bestseller',
    collections: ['bestseller', 'coupon']
  },
  {
    id: 12,
    name: 'Mavi Seramik Dəst',
    category: 'decor',
    price: 48,
    oldPrice: 60,
    rating: 4.6,
    reviews: 73,
    img: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80&auto=format&fit=crop',
    badge: null,
    collections: ['discount']
  },
];
