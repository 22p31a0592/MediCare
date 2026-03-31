/**
 * modals/AIChatInterface/hooks/useConnection.js
 *
 * BUGS FIXED:
 *  1. `if (res.data.success)` — backend at onrender.com returns
 *     { status: "healthy" } NOT { success: true }, so this always
 *     fell into the catch block → "property error doesn't exist" crash
 *     because the catch tried to read err.message on a non-Error object.
 *     Fixed: accept any 2xx response as connected.
 *
 *  2. Alert.alert() on every open — removed. Shows inline banner instead.
 *
 *  3. Timeout 5000ms → 3000ms for faster feedback.
 *
 *  4. Auto-retry once after 4s instead of requiring user to tap Retry.
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';

export function useConnection() {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: null,   // null = not yet checked → no banner shown on open
    testing:     true,
    message:     'Connecting…',
  });

  const retryCountRef = useRef(0);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    checkConnection();
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const checkConnection = async () => {
    setConnectionStatus((prev) => ({ ...prev, testing: true, message: 'Connecting…' }));

    try {
      const res = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 3000 });

      // FIX 1: Accept any 2xx — don't require res.data.success
      // onrender.com backend returns { status: "healthy" }, not { success: true }
      const d  = res.data ?? {};
      const ok = d.status === 'healthy'
              || d.status === 'ok'
              || d.success === true
              || res.status === 200;

      if (ok || res.status < 300) {
        setConnectionStatus({ isConnected: true, testing: false, message: 'Connected' });
        retryCountRef.current = 0;
      }
    } catch (err) {
      // FIX 2: No Alert.alert() — just show inline banner
      if (err.response) {
        // Server replied with an error code — it IS reachable
        setConnectionStatus({ isConnected: true, testing: false, message: 'Server issue' });
        return;
      }

      const msg =
        (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT')
          ? 'Connection timeout'
          : err.message?.includes('Network')
            ? 'Cannot reach server'
            : (err.message || 'Connection failed');

      setConnectionStatus({ isConnected: false, testing: false, message: msg });

      // FIX 4: Auto-retry once after 4s
      if (retryCountRef.current < 1) {
        retryCountRef.current += 1;
        retryTimerRef.current = setTimeout(checkConnection, 4000);
      }
    }
  };

  return { connectionStatus, setConnectionStatus, checkConnection };
}