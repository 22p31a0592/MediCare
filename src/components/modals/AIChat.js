import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Brain, Send, User, Bot, AlertCircle,
  X, Wifi, WifiOff, RefreshCw, Activity,
} from 'lucide-react-native';
import axios from 'axios';

import { API_BASE_URL } from '../../config/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseBackendList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      if (typeof item === 'string' && item.startsWith('[')) {
        return parseStringifiedPythonList(item);
      }
      return [item];
    }).filter(Boolean);
  }
  if (typeof raw === 'string') {
    if (raw.startsWith('[')) return parseStringifiedPythonList(raw);
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseStringifiedPythonList(str) {
  try {
    const json = str.replace(/'/g, '"');
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map((s) => String(s).trim()) : [];
  } catch {
    return str
      .replace(/[\[\]']/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

function buildBotMessage(data) {
  const disease     = data.disease     || 'Unknown';
  const confidence  = data.confidence  || 0;
  const medications = parseBackendList(data.medications);
  const precautions = parseBackendList(data.precautions);

  let text = `🔬 Based on your symptoms:\n\n`;
  text += `🩺 Predicted Condition: ${disease}\n`;
  text += `📊 Confidence: ${confidence}%\n\n`;

  if (medications.length > 0) {
    text += `💊 Recommended Medications:\n`;
    medications.forEach((med) => { text += `  • ${med}\n`; });
    text += '\n';
  }

  if (precautions.length > 0) {
    text += `🛡️ Precautions:\n`;
    precautions.forEach((p) => { text += `  • ${p}\n`; });
    text += '\n';
  }

  text += `ℹ️ Diet & exercise recommendations have been sent to your Diet and Exercise pages.`;
  return text.trim();
}

// ─── Human-readable error from axios error ──────────────────────────────────
function parseAxiosError(error, context = 'request') {
  // Timeout
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return `⏱️ Request timed out.\n\nThe server took too long to respond. Make sure your Python server is running and try again.`;
  }
  // No network / server not reachable
  if (
    error.message?.includes('Network Error') ||
    error.message?.includes('network error') ||
    error.code === 'ERR_NETWORK' ||
    !error.response
  ) {
    return `📡 Cannot reach server.\n\nCheck that your Python server is running at:\n${API_BASE_URL}\n\nCommand: python app.py`;
  }
  // HTTP error response from server
  if (error.response) {
    const status = error.response.status;
    const serverMsg = error.response.data?.error
                   || error.response.data?.message
                   || error.response.data?.detail
                   || null;

    if (status === 400) return `❌ Bad request: ${serverMsg || 'Invalid input sent to server.'}`;
    if (status === 404) return `❌ API endpoint not found (404).\n\nCheck your backend routes — expected: POST /api/chat`;
    if (status === 500) return `🔥 Server error (500).\n\n${serverMsg || 'Your Python server crashed. Check the terminal for the traceback.'}`;
    if (status === 503) return `🚫 Server unavailable (503). It may still be loading.`;
    return `❌ Server returned error ${status}${serverMsg ? ': ' + serverMsg : '.'}`;
  }
  return `❌ Unexpected error: ${error.message}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function AIChatInterface({ onClose, onRecommendationsGenerated, userName }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text:
        `Hello ${userName || 'there'}! 👋 I'm your health assistant.\n\n` +
        `Please describe your symptoms separated by commas.\n\n` +
        `For example:\n` +
        `"fever, headache, fatigue"\n` +
        `"cough, chest pain, shortness of breath"\n\n` +
        `I'll predict the likely condition and show medications, precautions, ` +
        `and send diet & exercise plans to your other tabs.`,
      timestamp: new Date(),
    },
  ]);

  const [inputText,        setInputText]        = useState('');
  const [isLoading,        setIsLoading]        = useState(false);
  const [isTyping,         setIsTyping]         = useState(false);
  const [retryCount,       setRetryCount]       = useState(0);

  // ── FIX 1: Start as unknown (null) not disconnected ─────────────────────
  // Previously started isConnected:false + testing:true which immediately
  // showed the "not connected" banner and triggered an Alert popup on open.
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: null,   // null = not yet checked (no banner shown)
    testing:     true,
    message:     'Connecting...',
  });

  const scrollViewRef  = useRef(null);
  const retryTimerRef  = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  useEffect(() => {
    checkConnection();
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // ── FIX 2: Faster connection check — 3s timeout, no Alert popup ─────────
  // Old: 5s timeout + Alert.alert popup that blocked the UI.
  // New: 3s timeout, silent inline status update only.
  //      If server is healthy but doesn't return success/status fields,
  //      we still mark connected (any 2xx is good enough).
  const checkConnection = useCallback(async () => {
    setConnectionStatus((prev) => ({ ...prev, testing: true, message: 'Connecting...' }));

    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`, {
        timeout: 3000,   // FIX: was 5000ms — reduced to 3000ms for faster feedback
      });

      // Accept any 2xx response — some backends return {} or { status:'ok' }
      const d = response.data;
      const ok = d?.status === 'healthy'
              || d?.status === 'ok'
              || d?.success === true
              || response.status === 200;

      if (ok) {
        setConnectionStatus({ isConnected: true, testing: false, message: 'Connected' });
        setRetryCount(0);
      } else {
        // Server replied but with unexpected body — treat as connected anyway
        setConnectionStatus({ isConnected: true, testing: false, message: 'Connected' });
        setRetryCount(0);
      }
    } catch (error) {
      // FIX 3: NO Alert.alert() — was popping up on every open.
      // Show inline error banner instead (much less disruptive).
      let msg = 'Cannot reach server';
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        msg = 'Connection timeout';
      } else if (error.response) {
        // Server replied with error — it IS reachable, just unhealthy
        // Still mark connected so user can try sending
        setConnectionStatus({ isConnected: true, testing: false, message: 'Server issue' });
        return;
      }
      setConnectionStatus({ isConnected: false, testing: false, message: msg });

      // FIX 4: Auto-retry once after 4 seconds instead of asking user
      if (retryCount < 1) {
        setRetryCount((n) => n + 1);
        retryTimerRef.current = setTimeout(() => {
          checkConnection();
        }, 4000);
      }
    }
  }, [retryCount]);

  // ── FIX 5: sendMessage — better error handling + success check fix ────────
  // Old bug: `if (!response.data.success)` threw an error even when the
  // backend returned a valid disease result without a `success` field.
  // New: only throw if there's clearly NO useful data in the response.
  const sendMessage = async (overrideText) => {
    const text = (overrideText || inputText).trim();
    if (!text || isLoading) return;

    const userMessage = {
      id:        Date.now(),
      type:      'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/chat`,
        { message: text },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );

      setIsTyping(false);
      setConnectionStatus({ isConnected: true, testing: false, message: 'Connected' });

      const data = response.data;

      // FIX 5: Only fail if there's genuinely no disease data at all.
      // Old code threw on `!data.success` even when disease was present.
      if (data.success === false && !data.disease) {
        throw new Error(data.error || data.message || 'Server returned an error.');
      }

      const botText = buildBotMessage(data);
      const botMessage = {
        id:         Date.now() + 1,
        type:       'bot',
        text:       botText,
        timestamp:  new Date(),
        disease:    data.disease,
        confidence: data.confidence,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (onRecommendationsGenerated) {
        const diet     = parseBackendList(data.ai_suggestions?.diet);
        const exercise = parseBackendList(data.ai_suggestions?.exercise);

        onRecommendationsGenerated({
          symptoms:                text.split(',').map((s) => s.trim()),
          conditions:              [{ name: data.disease }],
          dietRecommendations:     diet,
          exerciseRecommendations: exercise,
          confidence:              data.confidence || 0,
          chatHistory:             [...messages, userMessage, botMessage],
          timestamp:               new Date().toISOString(),
        });
      }

    } catch (error) {
      setIsTyping(false);
      setConnectionStatus((prev) => ({
        ...prev,
        isConnected: error.response ? true : false,
        testing: false,
        message: error.response ? 'Server issue' : 'Disconnected',
      }));

      // FIX 6: Use structured error messages — no more raw JS error dumps
      const errorText = parseAxiosError(error);

      setMessages((prev) => [
        ...prev,
        {
          id:        Date.now() + 1,
          type:      'bot',
          text:      errorText,
          timestamp: new Date(),
          isError:   true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render message ─────────────────────────────────────────────────────────

  const renderMessage = (message) => {
    const isBot = message.type === 'bot';
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isBot ? styles.botContainer : styles.userContainer,
        ]}
      >
        {isBot && (
          <View style={styles.botAvatar}>
            <Bot size={16} color="#fff" />
          </View>
        )}

        <View style={[
          styles.bubble,
          isBot  ? styles.botBubble  : styles.userBubble,
          message.isError && styles.errorBubble,
        ]}>
          <Text style={[styles.messageText, isBot ? styles.botText : styles.userText]}>
            {message.text}
          </Text>

          {message.disease && (
            <View style={styles.resultRow}>
              <View style={styles.diseaseBadge}>
                <Activity size={12} color="#7c3aed" />
                <Text style={styles.diseaseText}>{message.disease}</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{message.confidence}% confident</Text>
              </View>
            </View>
          )}

          {message.disease && (
            <View style={styles.dietNoticeBadge}>
              <Text style={styles.dietNoticeText}>
                🥗 Diet & 💪 Exercise plans updated in their tabs
              </Text>
            </View>
          )}

          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {!isBot && (
          <View style={styles.userAvatar}>
            <User size={16} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // FIX 7: Only show the disconnected banner when we KNOW we're offline.
  // null (not yet checked) = no banner. false = show banner.
  const showDisconnectedBanner =
    connectionStatus.isConnected === false && !connectionStatus.testing;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Brain size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Health Assistant</Text>
            <View style={styles.statusRow}>
              {connectionStatus.testing ? (
                <ActivityIndicator size={10} color="rgba(255,255,255,0.8)" />
              ) : connectionStatus.isConnected ? (
                <Wifi size={11} color="#10b981" />
              ) : (
                <WifiOff size={11} color="#ef4444" />
              )}
              <Text style={styles.headerSub}>
                {isTyping
                  ? 'Analysing symptoms...'
                  : connectionStatus.message}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={checkConnection}
            style={styles.iconBtn}
            disabled={connectionStatus.testing}
          >
            <RefreshCw size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <X size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Disconnected banner — inline, no Alert popup ── */}
      {showDisconnectedBanner && (
        <TouchableOpacity style={styles.errorBanner} onPress={checkConnection}>
          <AlertCircle size={15} color="#dc2626" />
          <Text style={styles.errorBannerText}>
            Not connected — tap to retry
          </Text>
        </TouchableOpacity>
      )}

      {/* Debug banner (dev only) */}
      {__DEV__ && (
        <View style={styles.debugBanner}>
          <Text style={styles.debugText}>🔧 {API_BASE_URL}</Text>
        </View>
      )}

      {/* ── Messages ───────────────────────────────────── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}

        {isTyping && (
          <View style={styles.botContainer}>
            <View style={styles.botAvatar}>
              <Bot size={16} color="#fff" />
            </View>
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Input area ─────────────────────────────────── */}
      <View style={styles.inputArea}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="e.g. fever, headache, fatigue"
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isLoading) && styles.sendBtnOff,
            ]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Send size={20} color="#fff" />
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>💡 Enter symptoms separated by commas</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRow}
        >
          {[
            { label: '🤒 Fever & Cold',  text: 'fever, chills, runny nose, cough' },
            { label: '🤕 Head & Body',   text: 'headache, fatigue, muscle pain, nausea' },
            { label: '🫁 Breathing',     text: 'cough, shortness of breath, chest pain, wheezing' },
            { label: '🤢 Stomach',       text: 'nausea, vomiting, abdominal pain, diarrhea' },
            { label: '❤️ Heart',         text: 'chest pain, palpitations, dizziness, sweating' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickBtn}
              onPress={() => sendMessage(item.text)}
              disabled={isLoading}
            >
              <Text style={styles.quickBtnText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },

  header: {
    backgroundColor:   '#7c3aed',
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    paddingTop:        Platform.OS === 'ios' ? 52 : 14,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  statusRow:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  iconBtn: {
    padding: 8, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fee2e2', padding: 10,
    borderBottomWidth: 1, borderBottomColor: '#fca5a5',
  },
  errorBannerText: { fontSize: 13, color: '#991b1b', fontWeight: '500' },

  debugBanner: {
    backgroundColor: '#fef9c3', padding: 6,
    borderBottomWidth: 1, borderBottomColor: '#fbbf24',
  },
  debugText: {
    fontSize: 10, color: '#92400e',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  messages:        { flex: 1 },
  messagesContent: { padding: 14, paddingBottom: 6 },

  messageContainer: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  botContainer:     { justifyContent: 'flex-start' },
  userContainer:    { justifyContent: 'flex-end' },

  botAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#7c3aed',
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },

  bubble:     { maxWidth: '76%', padding: 12, borderRadius: 16 },
  botBubble:  {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  userBubble:  { backgroundColor: '#1d4ed8', borderBottomRightRadius: 4 },
  errorBubble: { backgroundColor: '#fee2e2', borderLeftWidth: 3, borderLeftColor: '#ef4444' },

  messageText: { fontSize: 14, lineHeight: 21 },
  botText:     { color: '#111827' },
  userText:    { color: '#fff' },
  timestamp:   { fontSize: 10, color: '#9ca3af', marginTop: 6, alignSelf: 'flex-end' },

  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    flexWrap: 'wrap', gap: 6, marginTop: 10,
  },
  diseaseBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#ede9fe', paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 8,
  },
  diseaseText: { fontSize: 12, fontWeight: '700', color: '#6d28d9' },
  confidenceBadge: {
    backgroundColor: '#dbeafe', paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 8,
  },
  confidenceText: { fontSize: 11, fontWeight: '600', color: '#1e40af' },
  dietNoticeBadge: {
    backgroundColor: '#f0fdf4', borderLeftWidth: 3, borderLeftColor: '#16a34a',
    paddingHorizontal: 9, paddingVertical: 6, borderRadius: 6, marginTop: 8,
  },
  dietNoticeText: { fontSize: 11, color: '#15803d', fontWeight: '500' },

  typingBubble: {
    backgroundColor: '#fff', padding: 16, borderRadius: 16, borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  typingDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7c3aed', opacity: 0.5 },

  inputArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    paddingHorizontal: 14, paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 6 },
  input: {
    flex: 1, backgroundColor: '#f9fafb',
    borderRadius: 22, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#111827', maxHeight: 100,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#7c3aed',
    justifyContent: 'center', alignItems: 'center', elevation: 3,
  },
  sendBtnOff: { backgroundColor: '#d1d5db', elevation: 0 },

  hint: { fontSize: 11, color: '#9ca3af', marginBottom: 8, marginLeft: 4 },

  quickRow: { flexDirection: 'row' },
  quickBtn: {
    backgroundColor: '#f5f3ff',
    paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: 10, marginRight: 7,
    borderWidth: 1, borderColor: '#ddd6fe',
  },
  quickBtnText: { fontSize: 12, color: '#6d28d9', fontWeight: '600' },
});