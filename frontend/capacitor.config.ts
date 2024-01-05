import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.nivon',
  appName: 'Nivon',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    cleartext: true
	},
/*   server: {
		hostname: "192.168.1.61:8100",
		androidScheme: "https",
		url: "https://192.168.1.61:8100",
    cleartext: true
	}, */
  plugins: {
    "CapacitorSQLite": {
      "iosDatabaseLocation": "Library/CapacitorDatabase",
      "iosIsEncryption": true,
      "iosKeychainPrefix": "cap",
      "iosBiometric": {
        "biometricAuth": false,
        "biometricTitle": "Biometric login for capacitor sqlite"
      },
      "androidIsEncryption": true,
      "androidBiometric": {
        "biometricAuth": false,
        "biometricTitle": "Biometric login for capacitor sqlite",
        "biometricSubTitle": "Log in using your biometric"
      },

      "electronWindowsLocation": "C:\\ProgramData\\CapacitorDatabases",
      "electronMacLocation": "/Volumes/Development_Lacie/Development/Databases",
      "electronLinuxLocation": "Databases",
      LocalNotifications: {
        smallIcon: "ic_stat_icon_config_sample",
        iconColor: "#488AFF",
        sound: "default",
      },
      "BarcodeScanner": {
        "preferredCamera": "back",
      },
      "Console": {
        "hideLogs": false
      }
    }
  }
};

export default config;
