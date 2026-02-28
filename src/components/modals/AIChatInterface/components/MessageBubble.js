/**
 * modals/AIChatInterface/components/MessageBubble.js
 * ─────────────────────────────────────────────────────────
 * Renders a single chat message bubble (bot or user).
 *
 * If the bot detected health conditions it shows a small badge
 * pointing the user to the Diet & Exercise tabs — never showing
 * the actual diet/exercise content here in the chat.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot, User, Stethoscope } from 'lucide-react-native';

export function MessageBubble({ message }) {
  const isBot = message.type === 'bot';

  return (
    <View style={[styles.row, isBot ? styles.rowBot : styles.rowUser]}>
      {/* Bot avatar */}
      {isBot && (
        <View style={styles.botAvatar}>
          <Bot size={14} color="#fff" />
        </View>
      )}

      {/* Bubble */}
      <View style={[
        styles.bubble,
        isBot  ? styles.bubbleBot  : styles.bubbleUser,
        message.isError && styles.bubbleError,
      ]}>
        <Text style={[styles.text, isBot ? styles.textBot : styles.textUser]}>
          {message.text}
        </Text>

        {/* Badge shown when AI detected a condition — directs user to other tabs */}
        {message.hasConditions && (
          <View style={styles.condBadge}>
            <Stethoscope size={11} color="#7c3aed" />
            <Text style={styles.condBadgeText}>
              Conditions analysed · Check Diet & Exercise tabs
            </Text>
          </View>
        )}

        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {/* User avatar */}
      {!isBot && (
        <View style={styles.userAvatar}>
          <User size={14} color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row:      { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  rowBot:   { justifyContent: 'flex-start' },
  rowUser:  { justifyContent: 'flex-end' },

  botAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#6b7280',
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 8,
  },

  bubble:     { maxWidth: '76%', padding: 12, borderRadius: 16 },
  bubbleBot:  {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  bubbleUser:  { backgroundColor: '#1d4ed8', borderBottomRightRadius: 4 },
  bubbleError: { backgroundColor: '#fee2e2', borderLeftWidth: 3, borderLeftColor: '#ef4444' },

  text:    { fontSize: 14, lineHeight: 21 },
  textBot: { color: '#111827' },
  textUser:{ color: '#fff'    },

  condBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 8, marginTop: 8,
  },
  condBadgeText: { fontSize: 11, fontWeight: '600', color: '#7c3aed' },

  timestamp: { fontSize: 10, color: '#9ca3af', marginTop: 5, alignSelf: 'flex-end' },
});