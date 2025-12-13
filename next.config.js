/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 在构建时忽略 TypeScript 错误（与本地构建行为一致）
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

