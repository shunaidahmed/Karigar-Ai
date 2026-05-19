import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/gemini/:path*",
        destination: "https://generativelanguage.googleapis.com/v1beta/:path*",
      },
    ];
  },
};

export default nextConfig;
