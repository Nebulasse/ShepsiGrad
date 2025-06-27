// app.config.js
import { ExpoConfig } from 'expo/config';
import appJson from './app.json';

// Базовая конфигурация, использующая значения из app.json
const config: ExpoConfig = {
  ...appJson.expo,
  plugins: [
    "expo-router"
  ],
  scheme: "shepsigrad-admin",
  experiments: {
    tsconfigPaths: true
  },
  web: {
    ...appJson.expo.web,
    bundler: "metro"
  }
};

export default config; 