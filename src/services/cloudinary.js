import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if credentials exist
let isCloudinaryConfigured = false;

export function initCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl
    });
    isCloudinaryConfigured = true;
  } else if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    isCloudinaryConfigured = true;
  } else {
    isCloudinaryConfigured = false;
  }

  return isCloudinaryConfigured;
}

export async function uploadImageToCloudinary(fileBuffer, options = {}) {
  const configured = initCloudinary();

  if (!configured) {
    console.warn('⚠️ [Cloudinary] Credentials not set in environment variables. Returning fallback URL.');
    // Fallback: If buffer provided, convert to data URL for preview, or return fallback placeholder
    if (fileBuffer) {
      const base64 = fileBuffer.toString('base64');
      const mimeType = options.mimetype || 'image/jpeg';
      return {
        url: `data:${mimeType};base64,${base64}`,
        public_id: 'local_preview_' + Date.now(),
        provider: 'fallback_base64'
      };
    }
    return {
      url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
      public_id: 'placeholder_' + Date.now(),
      provider: 'placeholder'
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'atlasmall_products',
        transformation: options.transformation || [{ width: 1200, crop: 'limit' }, { quality: 'auto' }, { fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) {
          console.error('❌ [Cloudinary Upload Error]:', error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          provider: 'cloudinary'
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}
