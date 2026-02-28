/**
 * pages/DietPage/index.js  ← MAIN ENTRY
 * ─────────────────────────────────────────────────────────
 * BEHAVIOUR:
 *   No AI recs  → generic diet guide only
 *   AI recs     → AI personalised section first, generic below
 *
 * Sub-files:
 *  constants/dietData.js      ← GENERIC_DIET_SECTIONS static data
 *  components/DietHeader.js   ← banner (changes for AI mode)
 *  components/AIActiveBadge.js← confidence + condition count badge
 *  components/ConditionsList.js← detected conditions tags
 *  components/TipSection.js   ← single tip card (generic or AI)
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AlertTriangle, Brain } from 'lucide-react-native';

import { GENERIC_DIET_SECTIONS } from './constants/dietData';
import { DietHeader }            from './components/DietHeader';
import { AIActiveBadge }         from './components/AIActiveBadge';
import { ConditionsList }        from './components/ConditionsList';
import { TipSection }            from './components/TipSection';

export function DietPage({ user, aiRecommendations, userHealthData }) {
  const hasAI = !!(aiRecommendations?.dietRecommendations?.length > 0);

  // Build section list
  // AI mode: prepend personalised section; keep generic below
  // No AI:   generic sections only
  const sections = hasAI
    ? [
        {
          id:       'ai',
          category: 'Your Personalised Plan',
          icon:     Brain,
          color:    '#7c3aed',
          bgColor:  '#ede9fe',
          tips:     aiRecommendations.dietRecommendations,
          isAI:     true,
        },
        ...GENERIC_DIET_SECTIONS,
      ]
    : GENERIC_DIET_SECTIONS;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Banner */}
      <DietHeader hasAI={hasAI} />

      {/* Greeting card */}
      <View style={styles.greetCard}>
        <Text style={styles.greetTitle}>Hello {user?.name || 'there'}! 👋</Text>
        <Text style={styles.greetText}>
          {hasAI
            ? 'Your AI health analysis is active. The personalised nutrition plan below is based on your health conditions. General tips are included below for reference.'
            : 'A balanced diet is key to good health. Follow these evidence-based tips for better nutrition every day.'}
        </Text>
      </View>

      {/* AI badge — only when recs are active */}
      <AIActiveBadge
        aiRecommendations={aiRecommendations}
        userHealthData={userHealthData}
      />

      {/* Conditions list — only when AI has detected them */}
      <ConditionsList conditions={userHealthData?.conditions} />

      {/* Tip sections */}
      {sections.map((sec) => (
        <TipSection key={sec.id} section={sec} />
      ))}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <AlertTriangle size={15} color="#d97706" />
        <Text style={styles.disclaimerText}>
          {hasAI
            ? 'AI recommendations are based on symptom analysis. Consult a registered dietitian or your doctor for personalised medical nutrition therapy.'
            : 'These are general dietary guidelines. Consult a registered dietitian or healthcare provider for personalised advice.'}
        </Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },

  greetCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12, marginBottom: 10,
    padding: 16, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  greetTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  greetText:  { fontSize: 13, color: '#6b7280', lineHeight: 19 },

  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#fef9c3',
    borderLeftWidth: 3, borderLeftColor: '#f59e0b',
    marginHorizontal: 12, marginBottom: 12,
    padding: 12, borderRadius: 10,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },
});