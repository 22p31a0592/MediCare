import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import {
  Brain, Send, User, Bot, AlertCircle,
  X, Wifi, WifiOff, RefreshCw,
  Pill, Shield, Activity,
} from 'lucide-react-native';
import axios from 'axios';

import { API_BASE_URL } from '../../config/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Backend sometimes returns medications/diet as a stringified Python list:
 *   "['Bronchodilators', 'Inhaled corticosteroids']"
 * This function converts that into a clean JS array of strings.
 */
function parseBackendList(raw) {
  if (!raw) return [];

  // Already a JS array
  if (Array.isArray(raw)) {
    // Each element might itself be a stringified list — flatten
    return raw.flatMap((item) => {
      if (typeof item === 'string' && item.startsWith('[')) {
        return parseStringifiedPythonList(item);
      }
      return [item];
    }).filter(Boolean);
  }

  // Plain string
  if (typeof raw === 'string') {
    if (raw.startsWith('[')) return parseStringifiedPythonList(raw);
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return [];
}

function parseStringifiedPythonList(str) {
  try {
    // Replace single quotes with double quotes to make it valid JSON
    const json = str.replace(/'/g, '"');
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map((s) => String(s).trim()) : [];
  } catch {
    // Fallback: strip brackets and split
    return str
      .replace(/[\[\]']/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

/**
 * Build the formatted chat message text from the backend response.
 * Shows: predicted disease, confidence, medications, precautions.
 * Diet & exercise are NEVER shown here — they go to their own pages.
 */
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

// ─── Component ──────────────────────────────────────────────────────────────

export function AIChatInterface({ onClose, onRecommendationsGenerated, userName }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `Hello ${userName || 'there'}! 👋 I'm your health assistant.\n\n` +
            `Please describe your symptoms separated by commas.\n\n` +
            `For example:\n` +
            `"fever, headache, fatigue"\n` +
            `"cough, chest pain, shortness of breath"\n\n` +
            `I'll predict the likely condition and show medications, precautions, and send diet & exercise plans to your other tabs.`,
      timestamp: new Date(),
    },
  ]);
  const [inputText,        setInputText]        = useState('');
  const [isLoading,        setIsLoading]        = useState(false);
  const [isTyping,         setIsTyping]         = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    testing:     true,
    message:     'Testing connection...',
  });
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  useEffect(() => { checkConnection(); }, []);

  // ── Connection check ───────────────────────────────────────────────────────

  const checkConnection = async () => {
    setConnectionStatus({ isConnected: false, testing: true, message: 'Testing connection...' });
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
      // app.py returns { status: "healthy" } — check that, not .success
      if (response.data.status === 'healthy' || response.data.success) {
        setConnectionStatus({ isConnected: true, testing: false, message: 'Connected' });
      }
    } catch (error) {
      let errorMessage = 'Connection failed';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Cannot reach server';
      } else {
        errorMessage = error.message;
      }
      setConnectionStatus({ isConnected: false, testing: false, message: errorMessage });
      Alert.alert(
        '⚠️ Connection Error',
        `Cannot connect to backend:\n${API_BASE_URL}\n\nMake sure your Python server is running (python app.py).`,
        [
          { text: 'Retry',           onPress: checkConnection },
          { text: 'Continue Anyway', style: 'cancel' },
        ]
      );
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────

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
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      setIsTyping(false);
      setConnectionStatus({ isConnected: true, testing: false, message: 'Connected' });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Server error');
      }

      const data = response.data;

      // ── Build the chat message (disease + meds + precautions ONLY) ─────────
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

      // ── Pass diet & exercise to parent (Diet/Exercise tabs) ───────────────
      // These are NEVER shown in chat — they go directly to the other pages.
      if (onRecommendationsGenerated) {
        const diet     = parseBackendList(data.ai_suggestions?.diet);
        const exercise = parseBackendList(data.ai_suggestions?.exercise);

        onRecommendationsGenerated({
          symptoms:               text.split(',').map((s) => s.trim()),
          conditions:             [{ name: data.disease }],
          dietRecommendations:    diet,
          exerciseRecommendations: exercise,
          confidence:             data.confidence || 0,
          chatHistory:            [...messages, userMessage, botMessage],
          timestamp:              new Date().toISOString(),
        });
      }

    } catch (error) {
      setIsTyping(false);
      setConnectionStatus({ isConnected: false, testing: false, message: 'Disconnected' });

      let errorText = '⚠️ Error:\n\n';
      if (error.code === 'ECONNABORTED') {
        errorText += 'Request timed out.';
      } else if (error.message.includes('Network')) {
        errorText += `Cannot reach server at:\n${API_BASE_URL}\n\nCheck if Python server is running.`;
      } else if (error.response) {
        errorText += `Server error ${error.response.status}: ${error.response.data?.error || error.message}`;
      } else {
        errorText += error.message;
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: errorText, timestamp: new Date(), isError: true },
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
        style={[styles.messageContainer, isBot ? styles.botContainer : styles.userContainer]}
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

          {/* Disease + confidence badge on bot messages */}
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

          {/* Diet & exercise redirect notice */}
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Brain size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Health Assistant</Text>
            <View style={styles.statusRow}>
              {connectionStatus.isConnected
                ? <Wifi    size={11} color="#10b981" />
                : <WifiOff size={11} color="#ef4444" />
              }
              <Text style={styles.headerSub}>
                {isTyping ? 'Analysing symptoms...' : connectionStatus.message}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={checkConnection} style={styles.iconBtn} disabled={connectionStatus.testing}>
            <RefreshCw size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <X size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Disconnected banner */}
      {!connectionStatus.isConnected && !connectionStatus.testing && (
        <TouchableOpacity style={styles.errorBanner} onPress={checkConnection}>
          <AlertCircle size={15} color="#dc2626" />
          <Text style={styles.errorBannerText}>Not connected — tap to retry</Text>
        </TouchableOpacity>
      )}

      {/* Debug banner (dev only) */}
      {__DEV__ && (
        <View style={styles.debugBanner}>
          <Text style={styles.debugText}>🔧 {API_BASE_URL}</Text>
        </View>
      )}

      {/* Messages */}
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

      {/* Input area */}
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
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnOff]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Send size={20} color="#fff" />
            }
          </TouchableOpacity>
        </View>

        {/* Hint */}
        <Text style={styles.hint}>
          💡 Enter symptoms separated by commas
        </Text>

        {/* Quick symptom examples */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
          {[
            { label: '🤒 Fever & Cold',    text: 'fever, chills, runny nose, cough' },
            { label: '🤕 Head & Body',     text: 'headache, fatigue, muscle pain, nausea' },
            { label: '🫁 Breathing',       text: 'cough, shortness of breath, chest pain, wheezing' },
            { label: '🤢 Stomach',         text: 'nausea, vomiting, abdominal pain, diarrhea' },
            { label: '❤️ Heart',           text: 'chest pain, palpitations, dizziness, sweating' },
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
  container:   { flex: 1, backgroundColor: '#f3f4f6' },

  // Header
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

  // Banners
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

  // Messages
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

  // Result badges
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

  // Typing
  typingBubble: {
    backgroundColor: '#fff', padding: 16, borderRadius: 16, borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  typingDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7c3aed', opacity: 0.5 },

  // Input area
  inputArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    paddingHorizontal: 14, paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  inputRow:  { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 6 },
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