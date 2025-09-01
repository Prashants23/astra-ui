
module.exports = function (api) {
  // Cache based on environment for better development experience
  // This ensures rebuilds when switching between dev/prod modes
  const isProd = api.cache(() => process.env.NODE_ENV === 'production');
  
  return {
    presets: [
      'module:@react-native/babel-preset', // Updated to latest RN preset
    ],
    plugins: [
      'react-native-reanimated/plugin', // Ensures Reanimated compatibility
    ],
  };
};
