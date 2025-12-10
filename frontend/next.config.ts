import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporary: Allow deployment with ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checking enabled
  },

  images: {
    domains: [
      "lh3.googleusercontent.com",
      "images.unsplash.com",
      "cdn.discordapp.com",
      "mdhh-upload.s3.ap-southeast-1.amazonaws.com",
    ],
  },

  // Vercel optimizations
  experimental: {
    optimizePackageImports: ["lucide-react", "react-chartjs-2"],
  },
};

export default nextConfig;
