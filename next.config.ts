import type { NextConfig } from "next";

const removeImports = require("next-remove-imports")();

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
  // @ts-ignore
  turbopack: {}
};

export default removeImports(nextConfig);
