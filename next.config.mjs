/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 480, 640, 750, 828, 1080, 1200, 1920, 2048],
  },
};

export default nextConfig;
