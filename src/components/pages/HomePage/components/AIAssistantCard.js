/**
 * pages/HomePage/components/AIAssistantCard.js
 * ─────────────────────────────────────────────────────────
 * Tappable card that opens the AI Health Assistant chat.
 * Shows a badge if active recommendations exist.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Brain, MessageCircle, CheckCircle } from 'lucide-react-native';

export function AIAssistantCard({ aiRecommendations, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Brain size={22} color="#fff" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Health Assistant</Text>
          <Text style={styles.desc}>Symptom analysis · Diet · Exercise advice</Text>

          {aiRecommendations && (
            <View style={styles.activeBadge}>
              <CheckCircle size={11} color="#fff" />
              <Text style={styles.activeBadgeText}>Recommendations Active</Text>
            </View>
          )}
        </View>
      </View>
      <MessageCircle size={20} color="rgba(255,255,255,0.75)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1d4ed8',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  desc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  activeBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
});