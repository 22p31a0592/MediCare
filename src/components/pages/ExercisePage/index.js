/**
 * pages/ExercisePage/index.js  ← MAIN ENTRY
 * ─────────────────────────────────────────────────────────
 * BEHAVIOUR:
 *   No AI recs  → generic exercise guide only
 *   AI recs     → AI personalised plan first, generic below
 *
 * Sub-files:
 *  constants/exerciseData.js         ← GENERIC_EXERCISE_PLANS, INTENSITY_COLORS, GENERAL_TIPS
 *  components/ExerciseHeader.js      ← banner (changes for AI mode)
 *  components/ConditionsCard.js      ← conditions the AI plan accounts for
 *  components/ExercisePlanCard.js    ← single plan card (generic or AI)
 *  components/TipsCard.js            ← general tips (+ AI tip when active)
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Brain, AlertTriangle, Sparkles } from 'lucide-react-native';

import { GENERIC_EXERCISE_PLANS } from './constants/exerciseData';
import { ExerciseHeader }         from './components/ExerciseHeader';
import { ConditionsCard }         from './components/ConditionsCard';
import { ExercisePlanCard }       from './components/ExercisePlanCard';
import { TipsCard }               from './components/TipsCard';

export function ExercisePage({ user, aiRecommendations, userHealthData }) {
  const hasAI = !!(aiRecommendations?.exerciseRecommendations?.length > 0);

  // Build AI plan card from string recommendations
  const aiPlan = hasAI
    ? {
        id:       'ai',
        category: 'Your Personalised Plan',
        icon:     Brain,
        color:    '#7c3aed',
        bgColor:  '#ede9fe',
        isAI:     true,
        exercises: aiRecommendations.exerciseRecommendations.map((rec) => ({
          name:      rec,
          duration:  'As advised',
          intensity: 'Custom',
        })),
      }
    : null;

  const plans = aiPlan ? [aiPlan, ...GENERIC_EXERCISE_PLANS] : GENERIC_EXERCISE_PLANS;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Banner */}
      <ExerciseHeader hasAI={hasAI} />

      {/* Greeting */}
      <View style={styles.greetCard}>
        <Text style={styles.greetTitle}>Ready to exercise, {user?.name || 'Champion'}? 💪</Text>
        <Text style={styles.greetText}>
          {hasAI
            ? 'Your AI-personalised exercise plan is active. It is tailored to your health conditions. General plans are also included for reference.'
            : 'Regular physical activity is essential for good health. Start with exercises that match your current fitness level and build up gradually.'}
        </Text>
      </View>

      {/* AI active badge */}
      {hasAI && (
        <View style={styles.aiBadge}>
          <Sparkles size={18} color="#7c3aed" />
          <View style={styles.aiBadgeText}>
            <Text style={styles.aiBadgeTitle}>AI Fitness Plan Active</Text>
            <Text style={styles.aiBadgeSub}>
              Confidence: {aiRecommendations.confidence || 0}%
              {userHealthData?.conditions?.length
                ? `  ·  Personalised for ${userHealthData.conditions.length} condition${userHealthData.conditions.length > 1 ? 's' : ''}`
                : ''}
            </Text>
          </View>
        </View>
      )}

      {/* Conditions this plan accounts for */}
      <ConditionsCard conditions={userHealthData?.conditions} />

      {/* Plan cards */}
      {plans.map((plan) => (
        <ExercisePlanCard key={plan.id} plan={plan} />
      ))}

      {/* Tips */}
      <TipsCard hasAI={hasAI} />

      {/* Safety warning */}
      <View style={styles.warning}>
        <AlertTriangle size={15} color="#d97706" />
        <Text style={styles.warningText}>
          {hasAI
            ? 'These AI recommendations are based on symptom analysis. Always consult your doctor or physiotherapist before starting any new exercise programme, especially with existing health conditions.'
            : 'Consult your healthcare provider before starting any new exercise programme, especially if you have existing health conditions or take medications.'}
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

  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#ede9fe',
    borderLeftWidth: 3, borderLeftColor: '#7c3aed',
    marginHorizontal: 12, marginBottom: 10,
    padding: 12, borderRadius: 10,
  },
  aiBadgeText:  { flex: 1 },
  aiBadgeTitle: { fontSize: 13, fontWeight: '700', color: '#5b21b6', marginBottom: 2 },
  aiBadgeSub:   { fontSize: 11, color: '#6d28d9' },

  warning: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#fef9c3',
    borderLeftWidth: 3, borderLeftColor: '#f59e0b',
    marginHorizontal: 12, marginBottom: 12,
    padding: 12, borderRadius: 10,
  },
  warningText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },
});