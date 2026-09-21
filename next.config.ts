import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O site vive dentro do workspace do boilerplate; fixa a raiz para o Turbopack.
  turbopack: { root: process.cwd() },
  // Os anexos sobem direto para o Storage; as actions só recebem texto.
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};

export default nextConfig;
