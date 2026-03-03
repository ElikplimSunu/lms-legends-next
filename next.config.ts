import type { NextConfig } from "next";

const removeImports = require("next-remove-imports")();

const nextConfig: NextConfig = {
  // If we had proxy or images configured, they would go here
  // @ts-ignore
  turbopack: {}
};

export default removeImports(nextConfig);
