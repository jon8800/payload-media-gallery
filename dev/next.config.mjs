import { withPayload } from '@payloadcms/next/withPayload'
import { fileURLToPath } from 'url'
import path from 'path'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets the dev server accept HMR and dev requests from http://127.0.0.1.
  allowedDevOrigins: ['127.0.0.1'],
  // next dev would otherwise write an AGENTS.md into dev/.
  agentRules: false,
  // With Cache Components, the admin page hydrates under Suspense. This is the
  // setup where a client-only <dialog> breaks hydration, so keep it on to catch
  // that regression in the dev app.
  cacheComponents: true,
  partialPrefetching: true,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  serverExternalPackages: ['mongodb-memory-server'],
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
