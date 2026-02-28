/**
 * modals/AIChatInterface/components/ChatInput.js
 * ─────────────────────────────────────────────────────────
 * Text input row + 3 quick-action buttons.
 * Quick actions are limited to the 3 allowed topics only.
 * ─────────────────────────────────────────────────────────
 */

import React       from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Text }    from 'react-native';
import { Send }    from 'lucide-react-native';
import { QUICK_ACTIONS } from '../constants/chatConstants';

export function ChatInput({ inputText, setInputText, onSend, isLoading }) {
  return (
    <View style={styles.container}>
      {/* Text field + send button */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Describe symptoms or ask a health question…"
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnOff]}
          onPress={() => onSend()}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Send size={18} color="#fff" />
          }
        </TouchableOpacity>
      </View>

      {/* 3 topic quick-action buttons */}
      <View style={styles.quickRow}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={styles.quickBtn}
            onPress={() => onSend(action.text)}
            disabled={isLoading}
          >
            <Text style={styles.quickBtnText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:   '#fff',
    borderTopWidth:    1,
    borderTopColor:    '#e5e7eb',
    paddingHorizontal: 14,
    paddingTop:        10,
    paddingBottom:     Platform.OS === 'ios' ? 26 : 12,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 10,
  },
  input: {
    flex:             1,
    backgroundColor:  '#f9fafb',
    borderRadius:     22,
    paddingHorizontal: 14,
    paddingVertical:  11,
    fontSize:         14,
    color:            '#111827',
    maxHeight:        100,
    borderWidth:      1,
    borderColor:      '#e5e7eb',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center', alignItems: 'center',
    elevation: 2,
  },
  sendBtnOff: { backgroundColor: '#d1d5db', elevation: 0 },

  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickBtnText: { fontSize: 11, color: '#374151', fontWeight: '600' },
});