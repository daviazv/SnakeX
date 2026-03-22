/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['@tabler/icons-react'],
  },
}

module.exports = nextConfig
