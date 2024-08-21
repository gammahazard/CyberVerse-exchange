const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true, // Enable WebAssembly
      syncWebAssembly: true,  // Also enable sync WebAssembly (optional)
      topLevelAwait: true,    // Enable top-level await if needed
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async', // or 'webassembly/sync' depending on your use case
    });

    return config;
  },
};

module.exports = nextConfig;
