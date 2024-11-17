interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  apiBaseUrl: string;
}

export const getCloudinaryConfig = (): CloudinaryConfig => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [];
    if (!cloudName) missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('NEXT_PUBLIC_CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');

    throw new Error(`Missing Cloudinary configuration: ${missing.join(', ')}`);
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    apiBaseUrl: `https://api.cloudinary.com/v1_1/${cloudName}`,
  };
};
