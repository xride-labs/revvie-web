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
  webpack: (config, { dev }) => {
    if (dev) {
      // @sentry/node pulls in @prisma/instrumentation → @opentelemetry/instrumentation
      // which uses a dynamic require() expression webpack can't statically analyse.
      // Sentry never initialises in dev (guarded by isProd checks everywhere), so
      // this warning is a false-positive. Suppress it so the console stays clean.
      config.ignoreWarnings = [
        ...(config.ignoreWarnings ?? []),
        { module: /node_modules\/@prisma\/instrumentation/ },
        { module: /node_modules\/@opentelemetry\/instrumentation/ },
      ]
    }
    return config
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
