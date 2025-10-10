import type { NextConfig } from "next";

const nextConfig = {
  basePath: '/masters',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
      },
    ],
  },
};
module.exports = nextConfig;