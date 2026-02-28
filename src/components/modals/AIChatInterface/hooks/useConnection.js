/**
 * modals/AIChatInterface/hooks/useConnection.js
 * ─────────────────────────────────────────────────────────
 * Custom hook: manages backend connection status.
 * Tests the connection on mount and exposes a retry function.
 * ─────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { Alert, Platform }     from 'react-native';
import axios                   from 'axios';
import { API_BASE_URL }        from '../../../config/api';

export function useConnection() {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    testing:     true,
    message:     'Connecting…',
  });

  useEffect(() => { checkConnection(); }, []);

  const checkConnection = async () => {
    setConnectionStatus({ isConnected: false, testing: true, message: 'Connecting…' });

    try {
      const res = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });

      if (res.data.success) {
        setConnectionStatus({ isConnected: true, testing: false, message: 'Connected' });
      }
    } catch (err) {
      const msg =
        err.code === 'ECONNABORTED'       ? 'Connection timeout'
        : err.message.includes('Network') ? 'Cannot reach server'
        : err.message;

      setConnectionStatus({ isConnected: false, testing: false, message: msg });

      Alert.alert(
        '⚠️ Connection Error',
        `Cannot connect to backend:\n${API_BASE_URL}\n\nMake sure your Python server is running.`,
        [
          { text: 'Retry',           onPress: checkConnection },
          { text: 'Continue Anyway', style: 'cancel' },
        ]
      );
    }
  };

  return { connectionStatus, setConnectionStatus, checkConnection };
}