/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Whitelist external image domains for next/image optimization.
  // Required for Cloudinary images uploaded via the upload API.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google OAuth profile photos
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
