import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // Stores are derived from users in AuthContext, but we keep store-specific
  // extra data here: banners, descriptions, social links, etc.
  const [storeProfiles, setStoreProfiles] = useState(() => {
    const saved = localStorage.getItem('atlas_store_profiles');
    return saved ? JSON.parse(saved) : {};
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

  const getStoreProfile = (storeId) => storeProfiles[storeId] || {};

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
