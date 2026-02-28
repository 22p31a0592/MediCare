/**
 * modals/SettingsModal/index.js  ← MAIN SettingsModal ENTRY
 * ─────────────────────────────────────────────────────────
 * App settings modal.
 *
 * Sub-files (kept inline here because each is tiny):
 *  - SettingItem  (local component, defined below)
 *  - useSettings  (local hook, defined below)
 * ─────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  ScrollView, StyleSheet, Switch, Alert,
} from 'react-native';
import { X, Bell, Moon, Trash2, Download, Shield, Info, ChevronRight } from 'lucide-react-native';

// ── Local hook ────────────────────────────────────────────
function useSettingsState() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode,             setDarkMode]             = useState(false);
  return { notificationsEnabled, setNotificationsEnabled, darkMode, setDarkMode };
}

// ── Sub-component: a single settings row ─────────────────
function SettingItem({ iconBg, Icon, title, desc, right, onPress, danger }) {
  return (
    <TouchableOpacity
      style={[styles.item, danger && styles.itemDanger]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{Icon}</View>
        <View style={styles.itemText}>
          <Text style={[styles.itemTitle, danger && styles.itemTitleDanger]}>{title}</Text>
          <Text style={styles.itemDesc}>{desc}</Text>
        </View>
      </View>
      {right}
    </TouchableOpacity>
  );
}

// ── Main modal ────────────────────────────────────────────
export function SettingsModal({ visible, onClose, onReset }) {
  const { notificationsEnabled, setNotificationsEnabled, darkMode, setDarkMode } = useSettingsState();

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all medications and data. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => { onReset(); onClose(); } },
      ]
    );
  };

  const handleExport = () => {
    Alert.alert('Export Data', 'Your medication data will be exported to a file.', [{ text: 'OK' }]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color="#6b7280" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Preferences */}
            <Text style={styles.sectionLabel}>Preferences</Text>

            <SettingItem
              iconBg="#eff6ff" Icon={<Bell size={18} color="#1d4ed8" />}
              title="Notifications" desc="Enable medication reminders"
              right={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor={notificationsEnabled ? '#1d4ed8' : '#f3f4f6'}
                />
              }
            />

            <SettingItem
              iconBg="#f5f3ff" Icon={<Moon size={18} color="#7c3aed" />}
              title="Dark Mode" desc="Coming soon"
              right={
                <Switch
                  value={darkMode} onValueChange={setDarkMode} disabled
                  trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                  thumbColor="#f3f4f6"
                />
              }
            />

            {/* Data */}
            <Text style={styles.sectionLabel}>Data</Text>

            <SettingItem
              iconBg="#dcfce7" Icon={<Download size={18} color="#16a34a" />}
              title="Export Data" desc="Download your medication data"
              right={<ChevronRight size={18} color="#9ca3af" />}
              onPress={handleExport}
            />

            <SettingItem
              iconBg="#e0f2fe" Icon={<Shield size={18} color="#0284c7" />}
              title="Privacy" desc="All data stored locally on device"
              right={<ChevronRight size={18} color="#9ca3af" />}
            />

            {/* About */}
            <Text style={styles.sectionLabel}>About</Text>

            <SettingItem
              iconBg="#fef3c7" Icon={<Info size={18} color="#d97706" />}
              title="App Version" desc="MediCare v1.0.0"
              right={<ChevronRight size={18} color="#9ca3af" />}
            />

            {/* Danger */}
            <Text style={[styles.sectionLabel, styles.dangerLabel]}>Danger Zone</Text>

            <SettingItem
              iconBg="#fee2e2" Icon={<Trash2 size={18} color="#dc2626" />}
              title="Reset All Data" desc="Delete all medications and data"
              right={<ChevronRight size={18} color="#dc2626" />}
              onPress={handleReset}
              danger
            />

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
  },
  dangerLabel: { color: '#dc2626' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 7,
  },
  itemDanger: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  itemTitleDanger: { color: '#dc2626' },
  itemDesc: { fontSize: 12, color: '#6b7280' },
});