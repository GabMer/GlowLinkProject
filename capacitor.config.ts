import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Proyecto',
  webDir: 'www',
  server: {
    androidScheme: "https",
  },
  plugins: {
    Permissions: {
      android: {
        permissions: ["android.permission.READ_EXTERNAL_STORAGE", "android.permission.WRITE_EXTERNAL_STORAGE"],
      },
    },
  },
  cordova: {
    preferences: {
      AndroidXEnabled: "true",
    },
  },
};

export default config;
