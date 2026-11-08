import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.join(__dirname, ".."),
  outputFileTracingIncludes: {
    "/api/[...path]": [
      "../backend/src/data/jlpt_lessons/**/*",
      "../backend/src/db/**/*",
    ],
  },
};

export default nextConfig;
