import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "source.unsplash.com",       // Unsplash placeholders
      "images.unsplash.com",       // Unsplash CDN
      "openrouter.ai",             // Sometimes OpenRouter returns URLs
      "cdn.openrouter.ai",         // OpenRouter image CDN
      "oaidalleapiprodscus.blob.core.windows.net" // For DALL·E images
    ],
  },
};

export default nextConfig;
