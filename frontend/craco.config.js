// craco.config.js
const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      webpackConfig.entry = webpackConfig.entry.filter(
        (entry) => !entry.includes("react-refresh")
      );
      
      const hasReactRefreshPlugin = webpackConfig.plugins?.some(
        (plugin) => plugin?.constructor?.name === "ReactRefreshWebpackPlugin"
      );
      
      if (hasReactRefreshPlugin && process.env.NODE_ENV === "production") {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin?.constructor?.name !== "ReactRefreshWebpackPlugin"
        );
      }
      
      return webpackConfig;
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
  },
};
