import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  experimental: {
    // Allow sharp to run in serverless functions
  },
}

export default nextConfig;
