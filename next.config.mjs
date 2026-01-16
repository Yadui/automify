export default {
  images: {
    remotePatterns: [
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
