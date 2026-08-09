import type { ExpoConfig } from 'expo/config';

const expoOwner = process.env.EXPO_OWNER ?? 'REPLACE_ME';
const expoProjectId = process.env.EXPO_PROJECT_ID ?? 'REPLACE_ME_AFTER_EAS_INIT';

const config: ExpoConfig = {
  name: 'Map Starter',
  slug: 'map-starter',
  owner: expoOwner,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: process.env.SENTRY_PROJECT,
        organization: process.env.SENTRY_ORG,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow $(PRODUCT_NAME) to use your location when you choose Use my location.',
      },
    ],
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY,
      },
    ],
    ['expo-web-browser', { experimentalLauncherActivity: false }],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: expoProjectId,
    },
  },
};

export default config;
