/**
 * pages/DietPage/components/TipSection.js
 * ─────────────────────────────────────────────────────────
 * Renders a single diet tip card (generic or AI-personalised).
 * Used by DietPage to render each section in the list.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';

export function TipSection({ section }) {
  const Icon = section.icon;

  return (
    <View style={styles.card}>
      {/* Section header */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: section.bgColor }]}>
          <Icon size={22} color={section.color} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{section.category}</Text>
          {section.isAI && (
            <View style={styles.aiTag}>
              <Sparkles size={10} color="#7c3aed" />
              <Text style={styles.aiTagText}>AI Personalised</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tip list */}
      <View style={styles.tips}>
        {section.tips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={[styles.bullet, { backgroundColor: section.color }]} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12, marginBottom: 10,
    padding: 14, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  titleWrap: { flex: 1 },
  title:     { fontSize: 16, fontWeight: '700', color: '#111827' },
  aiTag:     { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  aiTagText: { fontSize: 10, fontWeight: '600', color: '#7c3aed' },

  tips:    { gap: 10 },
  tipRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet:  { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  tipText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
});