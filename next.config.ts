import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const isProd = process.env.NODE_ENV === 'production'

/**
 * Standalone output is opt-in via BUILD_STANDALONE=1, which the Dockerfile sets.
 *
 * It cannot be left on unconditionally: Turbopack emits externals chunks whose filenames
 * contain a colon (`[externals]_node:inspector_*.js`, pulled in by @sentry/node →
 * @opentelemetry). Colons are illegal in Windows filenames, so the trace-copy step fails
 * with EINVAL and takes the whole build down. Linux — and therefore the image — is fine.
 */
const standalone = process.env.BUILD_STANDALONE === '1'

const nextConfig: NextConfig = {
  ...(standalone ? { output: 'standalone' as const } : {}),
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
