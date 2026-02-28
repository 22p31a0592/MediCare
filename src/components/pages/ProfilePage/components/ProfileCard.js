/**
 * pages/ProfilePage/components/ProfileCard.js
 * ─────────────────────────────────────────────────────────
 * Avatar, user name, "X days active" label and Edit Profile button.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';

export function ProfileCard({ user, onEditName }) {
  const getMemberDays = () => {
    if (!user?.createdAt) return 0;
    return Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <User size={28} color="#fff" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.subtext}>{getMemberDays()} days active</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onEditName} style={styles.editBtn}>
        <Text style={styles.editBtnText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  info: { flex: 1 },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 3,
  },
  editBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 13,
    color: '#1d4ed8',
    fontWeight: '600',
  },
});