/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Render free plan has 512MB RAM which OOMs when sharp tries to
    // process 5-13MB PNG photos. Bypass optimization until photos are
    // compressed (then we can flip this back to false).
    unoptimized: true,
  },
};

export default nextConfig;
