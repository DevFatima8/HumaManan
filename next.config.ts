import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/ad/m/in',
        permanent: true,
      },
      {
        source: '/admin/:path*',
        destination: '/ad/m/in/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
