import type { NextConfig } from "next";

import nextRemoveImports from "next-remove-imports";
const removeImports = nextRemoveImports();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lymympomllfofnbaatcp.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // If we had proxy or images configured, they would go here
  turbopack: {}
};

export default removeImports(nextConfig);
