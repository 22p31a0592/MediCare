/**
 * modals/EditNameModal/index.js  ← MAIN EditNameModal ENTRY
 * ─────────────────────────────────────────────────────────
 * Modal to edit the user's name.
 * Simple modal — single file is sufficient.
 * ─────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

export function EditNameModal({ currentName, onClose, onSubmit }) {
  const [name, setName] = useState(currentName);
  const handleSubmit = () => { if (name.trim()) onSubmit(name.trim()); };

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Name</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color="#6b7280" /></TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.content}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              autoFocus
            />
            <View style={styles.btnRow}>
              <TouchableOpacity onPress={onClose} style={[styles.btn, styles.cancelBtn]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={[styles.btn, styles.saveBtn]}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#fff', borderRadius: 16,
    width: '100%', maxWidth: 400, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 18, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 9,
    padding: 12, fontSize: 16, color: '#111827', backgroundColor: '#f9fafb',
  },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn: { flex: 1, padding: 14, borderRadius: 9, alignItems: 'center' },
  cancelBtn: { borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  cancelText: { color: '#374151', fontSize: 15, fontWeight: '600' },
  saveBtn: { backgroundColor: '#1d4ed8' },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});