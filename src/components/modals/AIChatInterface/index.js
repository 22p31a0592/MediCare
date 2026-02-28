/**
 * modals/AIChatInterface/index.js  ← MAIN ENTRY
 * ─────────────────────────────────────────────────────────
 * Thin orchestrator — state and logic live in hooks,
 * UI pieces live in components.
 *
 *  hooks/
 *    useConnection.js   ← backend connection status + retry
 *    useChat.js         ← messages state + sendMessage()
 *
 *  components/
 *    ChatHeader.js           ← top bar with status + close
 *    TopicBar.js             ← 3 topic pills (symptoms/meds/doctor)
 *    DisconnectedBanner.js   ← error + debug banners
 *    MessageBubble.js        ← single chat bubble
 *    TypingIndicator.js      ← animated 3-dot indicator
 *    ChatInput.js            ← text field + quick-action buttons
 *
 *  constants/
 *    chatConstants.js   ← QUICK_ACTIONS, SYSTEM_PROMPT, INITIAL_MESSAGE
 * ─────────────────────────────────────────────────────────
 */

import React, { useRef, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';

// Hooks
import { useConnection } from './hooks/useConnection';
import { useChat }       from './hooks/useChat';

// Components
import { ChatHeader }          from './components/ChatHeader';
import { TopicBar }            from './components/TopicBar';
import { DisconnectedBanner, DebugBanner } from './components/DisconnectedBanner';
import { MessageBubble }       from './components/MessageBubble';
import { TypingIndicator }     from './components/TypingIndicator';
import { ChatInput }           from './components/ChatInput';

export function AIChatInterface({ onClose, onRecommendationsGenerated, userName }) {
  const scrollRef = useRef(null);

  // Connection
  const { connectionStatus, setConnectionStatus, checkConnection } = useConnection();

  // Chat state + send
  const {
    messages, inputText, setInputText,
    isLoading, isTyping,
    sendMessage,
  } = useChat({ userName, onRecommendationsGenerated, setConnectionStatus });

  // Auto-scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Top bar */}
      <ChatHeader
        connectionStatus={connectionStatus}
        isTyping={isTyping}
        onRefresh={checkConnection}
        onClose={onClose}
      />

      {/* Topic scope pills */}
      <TopicBar />

      {/* Error / debug banners */}
      {!connectionStatus.isConnected && !connectionStatus.testing && (
        <DisconnectedBanner onRetry={checkConnection} />
      )}
      <DebugBanner />

      {/* Message list */}
      <ScrollView
        ref={scrollRef}
        style={styles.msgList}
        contentContainerStyle={styles.msgListContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Input + quick-actions */}
      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        onSend={sendMessage}
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f3f4f6' },
  msgList:        { flex: 1 },
  msgListContent: { padding: 14, paddingBottom: 6 },
});