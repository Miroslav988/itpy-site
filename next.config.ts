import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces .next/standalone with a minimal server.js for the Docker image.
  output: "standalone",
  poweredByHeader: false,
  // Blog articles are read from content/blog at runtime; make sure they ship with the server.
  outputFileTracingIncludes: {
    "/**": ["./content/blog/**/*"],
  },
};

export default nextConfig;
