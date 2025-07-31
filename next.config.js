/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure proper image handling
  images: {
    unoptimized: true,
    domains: ['placehold.co', 'same-assets.com'],
  },
}

module.exports = nextConfig;
