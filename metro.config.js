const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Stub wa-sqlite.wasm for web — expo-sqlite web worker is not used in this app
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName.endsWith('.wasm')) {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Add COOP/COEP headers required for SharedArrayBuffer on web
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
