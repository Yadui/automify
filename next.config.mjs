/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["img.clerk.com", "ucarecdn.com"], // Add img.clerk.com to the list of allowed domains
  },
};
// next.config.js

export default nextConfig;
