import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  // Salida optimizada para contenedor Docker (server mínimo).
  output: "standalone",
  // Fija la raíz del proyecto (hay lockfiles en carpetas superiores).
  turbopack: { root: import.meta.dirname },
  outputFileTracingRoot: import.meta.dirname,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
