/**
 * modals/AIChatInterface/index.js  ← MAIN ENTRY
 *
 * CHANGED:
 *  - DisconnectedBanner only shown when isConnected === false (not null).
 *    null means "not checked yet" — no banner on initial open.
 *  - TopicBar removed (replaced by scrollable symptom chips in ChatInput).
 */

import React, { useRef, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';

import { useConnection } from './hooks/useConnection';
import { useChat }       from './hooks/useChat';

import { ChatHeader }                          from './components/ChatHeader';
import { DisconnectedBanner, DebugBanner }     from './components/DisconnectedBanner';
import { MessageBubble }                       from './components/MessageBubble';
import { TypingIndicator }                     from './components/TypingIndicator';
import { ChatInput }                           from './components/ChatInput';

export function AIChatInterface({ onClose, onRecommendationsGenerated, userName }) {
  const scrollRef = useRef(null);

  const { connectionStatus, setConnectionStatus, checkConnection } = useConnection();

  const {
    messages, inputText, setInputText,
    isLoading, isTyping, sendMessage,
  } = useChat({ userName, onRecommendationsGenerated, setConnectionStatus });

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  // Only show banner when we KNOW we're offline (false), not while checking (null)
  const showOfflineBanner =
    connectionStatus.isConnected === false && !connectionStatus.testing;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ChatHeader
        connectionStatus={connectionStatus}
        isTyping={isTyping}
        onRefresh={checkConnection}
        onClose={onClose}
      />

      {showOfflineBanner && <DisconnectedBanner onRetry={checkConnection} />}
      <DebugBanner />

      <ScrollView
        ref={scrollRef}
        style={styles.msgList}
        contentContainerStyle={styles.msgContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
      </ScrollView>

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
  container:  { flex: 1, backgroundColor: '#f3f4f6' },
  msgList:    { flex: 1 },
  msgContent: { padding: 14, paddingBottom: 6 },
});