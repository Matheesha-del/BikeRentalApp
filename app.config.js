import 'dotenv/config';

export default {
  expo: {
    name: "Bike Rental",
    slug: "bike-rental",
    version: "1.0.0",
    icon: "./assets/pin.png",
    android: {
      package: "com.example.ecobike",
    },
    ios: {
      bundleIdentifier: "com.example.ecobike",
    },
    extra: {
      EXPO_PUBLIC_MAPBOX_KEY: process.env.EXPO_PUBLIC_MAPBOX_KEY,
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_DATABASE_URL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      EXPO_PUBLIC_PROJECT_ID: process.env.EXPO_PUBLIC_PROJECT_ID,
      EXPO_PUBLIC_STORAGE_BUCKET: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
      EXPO_PUBLIC_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_APP_ID: process.env.EXPO_PUBLIC_APP_ID,

      // Add any other env variables here
    },
  },
};
