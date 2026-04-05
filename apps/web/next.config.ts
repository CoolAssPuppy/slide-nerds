import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingRoot: import.meta.dirname + '/../../',
  transpilePackages: ['@slidenerds/runtime'],
}

export default nextConfig
