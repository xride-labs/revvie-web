import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
}

const config = isProd
  ? withSentryConfig(nextConfig, {
      silent: !process.env.CI,
      org: process.env.NEXT_PUBLIC_SENTRY_ORG,
      project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
      widenClientFileUpload: true,
      sourcemaps: { deleteSourcemapsAfterUpload: true },
      webpack: {
        treeshake: { removeDebugLogging: true },
        automaticVercelMonitors: false,
      },
    })
  : nextConfig

export default config
