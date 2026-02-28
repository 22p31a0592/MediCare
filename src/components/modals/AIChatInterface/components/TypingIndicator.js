/**
 * modals/AIChatInterface/components/TypingIndicator.js
 * ─────────────────────────────────────────────────────────
 * Animated three-dot typing indicator shown while bot is thinking.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bot } from 'lucide-react-native';

export function TypingIndicator() {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Bot size={14} color="#fff" />
      </View>
      <View style={styles.bubble}>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  avatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 16, borderBottomLeftRadius: 4,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  dots:   { flexDirection: 'row', gap: 6 },
  dot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1d4ed8', opacity: 0.5 },
});