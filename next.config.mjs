/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mc-heads.net',
      },
      {
        protocol: 'https',
        hostname: 'textures.minecraft.net',
      },
    ],
  },
};

export default nextConfig;
