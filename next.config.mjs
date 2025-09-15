/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for Vercel deployment
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'drizzle-orm']
  },
  webpack: (config, { dev, isServer }) => {
    // Handle SQLite and Node.js modules in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'better-sqlite3': false,
        'fs': false,
        'path': false,
        'os': false,
        'child_process': false,
        'webpack-bundle-analyzer': false,
        'opener': false,
        'querystring': false,
      };
    }

    // Optimize bundle splitting
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          copilot: {
            test: /[\\/]node_modules[\\/]@copilotkit[\\/]/,
            name: 'copilot',
            chunks: 'all',
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },
  images: {
    domains: ['localhost', 'beta.bitebase.app'],
  },
  // Enable CSS modules and other styling options
  sassOptions: {
    includePaths: ['./src'],
  },
  // Production optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Environment variables for client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api-beta.bitebase.app',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://beta.bitebase.app',
  }
};

export default nextConfig;