import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // Stores are derived from users in AuthContext, but we keep store-specific
  // extra data here: banners, descriptions, social links, etc.
  const defaultProfiles = {
    vogue_art: {
      storeName: 'Vogue Art',
      description: 'Müasir premium geyim kolleksiyaları, dünya markaları və zərif zərgərlik nümunələri.',
      banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
      phone: '+994 50 111 22 33',
      email: 'vogue@bame.az',
      address: 'Bakı, Nizami küçəsi'
    },
    modernist: {
      storeName: 'Modernist',
      description: 'Minimalist və müasir üslubda geyim və gündəlik şık aksesuarlar. Gənc dizaynerlərin fərqli seçimləri.',
      banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200',
      phone: '+994 51 222 33 44',
      email: 'modernist@bame.az',
      address: 'Bakı, 28 May'
    },
    zarif_atelye: {
      storeName: 'Zərif Atelye',
      description: 'Əl işi geyimlər, toxunma aksesuarlar və klassik atelye dizaynları. Hər bədənə uyğun mükəmməl kəsim.',
      banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
      phone: '+994 55 333 44 55',
      email: 'zarif@bame.az',
      address: 'Bakı, İçərişəhər'
    },
    style_lab: {
      storeName: 'Style Lab',
      description: 'Küçə dəbi və premium idman geyimlərinin laboratoriyası. Bakının ən trend üslub bələdçisi.',
      banner: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200',
      phone: '+994 70 444 55 66',
      email: 'stylelab@bame.az',
      address: 'Bakı, Port Baku'
    },
    baku_closet: {
      storeName: 'Baku Closet',
      description: 'Vintage geyimlər, retro aksesuarlar və təkrarolunmaz klassik geyim şkafları. Zamanın sınağından keçmiş dərslər.',
      banner: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200',
      phone: '+994 99 555 66 77',
      email: 'closet@bame.az',
      address: 'Bakı, Fəvvarələr Meydanı'
    },
    silk_way: {
      storeName: 'Silk Way',
      description: 'Əsl ipək parçalar, zərif şərflər, yay köynəkləri və lüks təbii parçalardan hazırlanan geyim növləri.',
      banner: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&q=80&w=1200',
      phone: '+994 12 400 90 90',
      email: 'silkway@bame.az',
      address: 'Bakı, Səbail'
    }
  };

  const [storeProfiles, setStoreProfiles] = useState(() => {
    const saved = localStorage.getItem('atlas_store_profiles');
    return saved ? JSON.parse(saved) : defaultProfiles;
  });

  useEffect(() => {
    localStorage.setItem('atlas_store_profiles', JSON.stringify(storeProfiles));
  }, [storeProfiles]);

  const updateStoreProfile = (storeId, data) => {
    setStoreProfiles(prev => ({
      ...prev,
      [storeId]: { ...(prev[storeId] || {}), ...data }
    }));
  };

  const getStoreProfile = (storeId) => {
    if (storeProfiles[storeId]) return storeProfiles[storeId];
    
    // Get store name from registered users
    const savedUsers = localStorage.getItem('atlas_users_db');
    let storeName = 'Yeni Mağaza';
    let address = 'Bakı, Nizami küçəsi';
    if (savedUsers) {
      try {
        const usersList = JSON.parse(savedUsers);
        const vendor = usersList.find(u => u.storeId === storeId);
        if (vendor) {
          storeName = vendor.storeName || vendor.name;
        }
      } catch (e) {
        console.error(e);
      }
    }

    return {
      storeName,
      description: 'Müasir kolleksiyalar və eksklüziv butik üslublu məhsullar. Tezliklə yeni məhsullarımız burada yerləşdiriləcək.',
      banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
      phone: '+994 50 123 45 67',
      email: `${storeId}@bame.az`,
      address
    };
  };

  return (
    <StoreContext.Provider value={{
      storeProfiles,
      updateStoreProfile,
      getStoreProfile
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
