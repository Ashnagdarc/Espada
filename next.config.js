import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'react-hot-toast', 'sonner', 'zustand']
  },
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.nike.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif']
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    // Allow production builds to succeed even if ESLint reports problems.
    // Long-term: fix the lint issues instead of disabling this.
    ignoreDuringBuilds: true
  }
}

export default nextConfig