/**
 * modals/NamePromptModal/index.js  ← MAIN NamePromptModal ENTRY
 * ─────────────────────────────────────────────────────────
 * First-time welcome modal to collect the user's name.
 * Simple enough for a single file — no sub-components needed.
 * ─────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export function NamePromptModal({ onSubmit }) {
  const [name, setName] = useState('');
  const handleSubmit = () => { if (name.trim()) onSubmit(name.trim()); };

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>MediCare</Text>
            <Text style={styles.tagline}>Your Personal Medication Tracker</Text>
          </View>

          {/* Form */}
          <View style={styles.content}>
            <Text style={styles.welcome}>Welcome! Let's get started.</Text>
            <Text style={styles.label}>What's your name?</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.btn, !name.trim() && styles.btnDisabled]}
              disabled={!name.trim()}
            >
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  container: {
    backgroundColor: '#fff', borderRadius: 18,
    width: '100%', maxWidth: 400, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 14, elevation: 10,
  },
  header: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 30, paddingHorizontal: 24, alignItems: 'center',
  },
  appName: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5, marginBottom: 6 },
  tagline: { fontSize: 14, color: '#bfdbfe' },
  content: { padding: 24 },
  welcome: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 9,
    padding: 14, fontSize: 17, color: '#111827',
    backgroundColor: '#f9fafb', marginBottom: 20,
  },
  btn: { backgroundColor: '#1d4ed8', padding: 15, borderRadius: 9, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#93c5fd' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});