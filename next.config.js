/** @type {import('next').NextConfig} */
const nextConfig = {
    externals: ['pino-pretty'],
    eslint: {
        ignoreDuringBuilds: true,
      },
}

module.exports = nextConfig
