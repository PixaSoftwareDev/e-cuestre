import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  // Permite ver la app en dev a través de un túnel (cloudflared/ngrok).
  allowedDevOrigins: ["*.trycloudflare.com", "*.ngrok-free.app", "*.loca.lt"],
  // Salida optimizada para contenedor Docker (server mínimo).
  output: "standalone",
  // Fija la raíz del proyecto (hay lockfiles en carpetas superiores).
  turbopack: { root: import.meta.dirname },
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // Cloudinary y Unsplash ya sirven las imágenes optimizadas/transformadas,
    // así que evitamos que Next las vuelva a optimizar (esa re-optimización
    // hacía timeout contra Cloudinary y saturaba el dev server).
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
