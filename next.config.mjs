/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode (causes double renders and duplicate records in dev)
  // This was causing product records to be created twice
  reactStrictMode: false,

  // Disable typescript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization settings
  images: {
    unoptimized: true,
  },
  
  // Output standalone for better deployment
  output: 'standalone',
};

export default nextConfig;
