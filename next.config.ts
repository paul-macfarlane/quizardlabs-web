import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.R2_HOSTNAME}/**`,
      },
    ],
  },
};

export default nextConfig;
