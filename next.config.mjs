export default {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "ucarecdn.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript build errors
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during the build
  },
};
