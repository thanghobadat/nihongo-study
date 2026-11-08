import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const rawEnvUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "";
    const backendUrl =
      rawEnvUrl && !rawEnvUrl.includes("localhost")
        ? rawEnvUrl.replace(/\/+$/, "")
        : process.env.NODE_ENV === "production"
        ? "https://nihongo-flow-backend.onrender.com"
        : "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
