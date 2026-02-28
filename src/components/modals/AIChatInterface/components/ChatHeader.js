/**
 * modals/AIChatInterface/components/ChatHeader.js
 * ─────────────────────────────────────────────────────────
 * Top bar: title, connection status dot, refresh + close buttons.
 * ─────────────────────────────────────────────────────────
 */

import React        from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Stethoscope, Wifi, WifiOff, RefreshCw, X } from 'lucide-react-native';

export function ChatHeader({ connectionStatus, isTyping, onRefresh, onClose }) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Stethoscope size={22} color="#fff" />
        </View>
        <View>
          <Text style={styles.title}>Medical Assistant</Text>
          <View style={styles.statusRow}>
            {connectionStatus.isConnected
              ? <Wifi    size={11} color="#6ee7b7" />
              : <WifiOff size={11} color="#fca5a5" />
            }
            <Text style={styles.subtitle}>
              {isTyping ? 'Typing…' : connectionStatus.message}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          onPress={onRefresh}
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
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor:   '#1d4ed8',
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    paddingTop:        Platform.OS === 'ios' ? 52 : 14,
    elevation:         4,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.15,
    shadowRadius:      4,
  },
  left:       { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  right:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox:    {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  title:      { fontSize: 17, fontWeight: '700', color: '#fff' },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  subtitle:   { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  iconBtn:    {
    padding: 8, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});