import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', '100.95.176.29'],
};

export default nextConfig;
