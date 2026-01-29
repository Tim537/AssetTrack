import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler is still experimental and can break production runtime
  // in certain combinations of Next/React/Node.
  reactCompiler: false,
};

export default nextConfig;
