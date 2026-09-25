import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // google-spreadsheet y google-auth-library sólo corren en el servidor (API routes)
  serverExternalPackages: ["google-spreadsheet", "google-auth-library"],
};

export default nextConfig;
