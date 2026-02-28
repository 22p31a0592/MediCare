import { Platform } from 'react-native';

const YOUR_NETWORK_IP = '192.168.29.236';

export const API_CONFIG = {
  // For USB connection, use localhost after adb reverse
  USB_CONNECTION: 'http://localhost:5000',
  
  ANDROID_EMULATOR: 'https://medicare-backend-w779.onrender.com',
  IOS_SIMULATOR: 'http://localhost:5000',
  REAL_DEVICE_WIFI: `http://${YOUR_NETWORK_IP}:5000`,
  PRODUCTION: 'https://medicare-backend-w779.onrender.com',
  
  getBaseUrl: () => {
    if (__DEV__) {
      // ⭐ For USB connection, use localhost
      const USING_USB = true; // Set to true for USB connection
      
      if (USING_USB) {
        console.log('📱 Using USB connection: http://localhost:5000');
        return API_CONFIG.USB_CONNECTION;
      }
      
      // For WiFi testing on real device
      const IS_REAL_DEVICE = false;
      if (IS_REAL_DEVICE) {
        return API_CONFIG.REAL_DEVICE_WIFI;
      }
      
      // For emulator/simulator
      if (Platform.OS === 'android') {
        return API_CONFIG.ANDROID_EMULATOR;
      } else {
        return API_CONFIG.IOS_SIMULATOR;
      }
    }
    return API_CONFIG.PRODUCTION;
  }
};

export const API_BASE_URL = API_CONFIG.PRODUCTION;