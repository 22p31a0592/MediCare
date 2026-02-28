/**
 * pages/HomePage/index.js  ← MAIN HomePage ENTRY
 * ─────────────────────────────────────────────────────────
 * Orchestrates all HomePage sub-components and the AI chat modal.
 * This file should contain NO business logic — it only:
 *   1. Reads state from useHomeState hook
 *   2. Renders sub-components in order
 *   3. Passes props down
 *
 * Sub-components:
 *  components/StatsBar.js               ← top stats row
 *  components/AIAssistantCard.js        ← open AI chat
 *  components/AIRecommendationsSummary.js ← active rec summary
 *  components/MedicationListHeader.js   ← "Medications N" label
 *  components/MedicationCard.js         ← individual pill card
 *  components/EmptyState.js             ← when no pills added
 *
 * Hooks / Helpers:
 *  useHomeState.js   ← all state + derived values
 *  homeHelpers.js    ← pure utility functions
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { ScrollView, Modal, View, StyleSheet } from 'react-native';

// Hook
import { useHomeState } from './useHomeState';

// Sub-components
import { StatsBar }                  from './components/StatsBar';
import { AIAssistantCard }           from './components/AIAssistantCard';
import { AIRecommendationsSummary }  from './components/AIRecommendationsSummary';
import { MedicationListHeader }      from './components/MedicationListHeader';
import { MedicationCard }            from './components/MedicationCard';
import { EmptyState }                from './components/EmptyState';

// AI Chat modal (kept in modals/ folder as it is a full-screen modal)
import { AIChatInterface } from '../../modals/AIChatInterface';

export function HomePage({
  pills,
  user,
  aiRecommendations,
  onDeletePill,
  onMarkTaken,
  onAIRecommendations,
  onClearAIRecommendations,
}) {
  // All state + derived values in one hook
  const {
    showAIChat,
    setShowAIChat,
    totalPills,
    daysRemaining,
    alarmsSet,
  } = useHomeState(pills);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <StatsBar
          daysRemaining={daysRemaining}
          totalPills={totalPills}
          alarmsSet={alarmsSet}
        />

        {/* AI Assistant card */}
        <AIAssistantCard
          aiRecommendations={aiRecommendations}
          onPress={() => setShowAIChat(true)}
        />

        {/* Active AI recommendations summary */}
        <AIRecommendationsSummary
          aiRecommendations={aiRecommendations}
          onClear={onClearAIRecommendations}
        />

        {/* Medications section */}
        <MedicationListHeader count={pills.length} />

        {pills.length === 0 ? (
          <EmptyState />
        ) : (
          pills.map((pill, index) => (
            <MedicationCard
              key={pill._id}
              pill={pill}
              index={index}
              onDelete={onDeletePill}
              onMarkTaken={onMarkTaken}
            />
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* AI Chat — full-screen modal */}
      <Modal visible={showAIChat} animationType="slide" presentationStyle="fullScreen">
        <AIChatInterface
          onClose={() => setShowAIChat(false)}
          onRecommendationsGenerated={(recs) => {
            if (onAIRecommendations) onAIRecommendations(recs);
          }}
          userName={user?.name}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  bottomPadding: {
    height: 90,
  },
});