import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA headers
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
  // Allow external Gemini API calls
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
