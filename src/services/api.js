/**
 * AtlasMall API Service
 * Handles communication with full-stack Express API backend connected to Neon.tech PostgreSQL and Cloudinary.
 */

export async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (error) {
    console.warn('[API] Health check error:', error);
    return { status: 'error', error: error.message };
  }
}

/**
 * Upload image to Cloudinary via backend API
 * @param {File | Blob | string} file - File object or base64 data string
 * @param {string} [folder] - Optional target folder in Cloudinary
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export async function uploadImageToCloudinary(file, folder = 'atlasmall_products') {
  try {
    const formData = new FormData();
    if (typeof file === 'string') {
      // Base64 image
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: file, folder })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload base64 image');
      }
      return await res.json();
    } else {
      // File / Blob object
      formData.append('image', file);
      formData.append('folder', folder);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload image file');
      }
      return await res.json();
    }
  } catch (error) {
    console.error('[API] Cloudinary image upload error:', error);
    throw error;
  }
}

/**
 * Fetch products from Neon PostgreSQL
 */
export async function fetchProductsFromApi(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params.storeId) queryParams.append('storeId', params.storeId);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/api/products${queryString ? `?${queryString}` : ''}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (error) {
    console.warn('[API] Fetch products error:', error);
    return null;
  }
}

/**
 * Create a new product in Neon PostgreSQL with Cloudinary image URL
 */
export async function createProductApi(productData) {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    return await res.json();
  } catch (error) {
    console.error('[API] Create product error:', error);
    throw error;
  }
}

/**
 * Delete product from Neon PostgreSQL
 */
export async function deleteProductApi(id) {
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    return await res.json();
  } catch (error) {
    console.error('[API] Delete product error:', error);
    throw error;
  }
}

/**
 * Fetch stores from Neon PostgreSQL
 */
export async function fetchStoresApi() {
  try {
    const res = await fetch('/api/stores');
    if (!res.ok) throw new Error('Failed to fetch stores');
    return await res.json();
  } catch (error) {
    console.warn('[API] Fetch stores error:', error);
    return null;
  }
}

/**
 * Update store details in Neon PostgreSQL
 */
export async function updateStoreApi(storeId, storeData) {
  try {
    const res = await fetch(`/api/stores/${storeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeData)
    });
    if (!res.ok) throw new Error('Failed to update store');
    return await res.json();
  } catch (error) {
    console.error('[API] Update store error:', error);
    throw error;
  }
}

/**
 * Create order in Neon PostgreSQL
 */
export async function createOrderApi(orderData) {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return await res.json();
  } catch (error) {
    console.error('[API] Create order error:', error);
    throw error;
  }
}
