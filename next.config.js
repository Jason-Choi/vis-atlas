/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/vis-atlas',
  reactStrictMode: true,
  experimental: {
    esmExternals: false,
  }

}

module.exports = nextConfig
