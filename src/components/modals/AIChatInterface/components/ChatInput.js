/**
 * modals/AIChatInterface/components/ChatInput.js
 *
 * CHANGED:
 *  - Quick action chips now show exact disease-category symptoms
 *    that the backend ML model recognises (underscore format).
 *  - Scrollable horizontal chips instead of 3 fixed-width buttons.
 *  - Placeholder updated with underscore tip.
 */

import React from 'react';
import {
  View, TextInput, TouchableOpacity,
  Text, StyleSheet, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { QUICK_ACTIONS } from '../constants/chatConstants';

export function ChatInput({ inputText, setInputText, onSend, isLoading }) {
  return (
    <View style={styles.container}>
      {/* Text field + send button */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g. chest_pain, high_fever, cough…"
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

      {/* Scrollable symptom quick-action chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={styles.chip}
            onPress={() => onSend(action.text)}
            disabled={isLoading}
          >
            <Text style={styles.chipText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 10, marginBottom: 10,
  },
  input: {
    flex:              1,
    backgroundColor:   '#f9fafb',
    borderRadius:      22,
    paddingHorizontal: 14,
    paddingVertical:   11,
    fontSize:          14,
    color:             '#111827',
    maxHeight:         100,
    borderWidth:       1,
    borderColor:       '#e5e7eb',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center', alignItems: 'center',
    elevation: 2,
  },
  sendBtnOff: { backgroundColor: '#d1d5db', elevation: 0 },

  scroll:        { flexDirection: 'row' },
  scrollContent: { gap: 8, paddingRight: 4 },
  chip: {
    backgroundColor:   '#eff6ff',
    paddingVertical:   7,
    paddingHorizontal: 13,
    borderRadius:      10,
    borderWidth:       1,
    borderColor:       '#bfdbfe',
  },
  chipText: { fontSize: 12, color: '#1d4ed8', fontWeight: '600' },
});