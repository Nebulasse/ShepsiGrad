// app.config.js
module.exports = {
  expo: {
    name: "ShepsiGrad",
    slug: "ShepsiGrad",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.shepsigrad.app",
      jsEngine: "jsc"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.shepsigrad.app",
      jsEngine: "jsc"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [],
    scheme: "shepsigrad",
    experiments: {
      tsconfigPaths: true,
      turboModules: false
    },
    extra: {
      experimentalBridgeless: false
    },
    sdkVersion: "53.0.0"
  }
};

// Программно отключаем новую архитектуру
process.env.EXPO_USE_NEW_ARCH = "0";
process.env.RCT_NEW_ARCH_ENABLED = "0";
process.env.EXPO_USE_HERMES = "0";
process.env.EXPO_NO_BUNDLER = "0";
process.env.EX_DEV_CLIENT_NETWORK_INSPECTOR = "0";
process.env.__REACT_NATIVE_NEW_ARCHITECTURE_ENABLED = "false"; 