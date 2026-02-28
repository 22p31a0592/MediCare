/**
 * pages/ProfilePage/index.js  ← MAIN ProfilePage ENTRY
 * ─────────────────────────────────────────────────────────
 * Orchestrates all ProfilePage sub-components.
 *
 * Sub-components:
 *  components/ProfileCard.js            ← avatar, name, edit
 *  components/MedStatsGrid.js           ← active meds + days grid
 *  components/MedicationProgressList.js ← per-pill progress bars
 *  components/AccountInfo.js            ← member since, totals
 *
 * Hooks:
 *  useMedicationProgress.js  ← progress calc with day-progress bug fix
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Settings } from 'lucide-react-native';

import { ProfileCard }            from './components/ProfileCard';
import { MedStatsGrid }           from './components/MedStatsGrid';
import { MedicationProgressList } from './components/MedicationProgressList';
import { AccountInfo }            from './components/AccountInfo';

export function ProfilePage({ user, pillCount, pills, onEditName, onSettings }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Profile</Text>
        <TouchableOpacity onPress={onSettings} style={styles.settingsBtn}>
          <Settings size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ProfileCard user={user} onEditName={onEditName} />

      <MedStatsGrid pillCount={pillCount} pills={pills} />

      <MedicationProgressList pills={pills} />

      <AccountInfo user={user} pillCount={pillCount} />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  settingsBtn: {
    padding: 7,
    borderRadius: 9,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bottomPadding: { height: 90 },
});