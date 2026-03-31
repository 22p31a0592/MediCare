/**
 * pages/HomePage/index.js
 * Updated: uses totalMeds (renamed from totalPills) from useHomeState.
 */

import React from 'react';
import { ScrollView, Modal, View, StyleSheet } from 'react-native';

import { useHomeState } from './useHomeState';

import { StatsBar }                  from './components/StatsBar';
import { AIAssistantCard }           from './components/AIAssistantCard';
import { AIRecommendationsSummary }  from './components/AIRecommendationsSummary';
import { MedicationListHeader }      from './components/MedicationListHeader';
import { MedicationCard }            from './components/MedicationCard';
import { EmptyState }                from './components/EmptyState';

import { AIChatInterface } from '../../../components/modals/AIChatInterface/index';

export function HomePage({
  pills,
  user,
  aiRecommendations,
  onDeletePill,
  onMarkTaken,
  onAIRecommendations,
  onClearAIRecommendations,
}) {
  const {
    showAIChat, setShowAIChat,
    totalMeds,          // ← was totalPills
    daysRemaining,
    alarmsSet,
  } = useHomeState(pills);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <StatsBar
          daysRemaining={daysRemaining}
          totalMeds={totalMeds}       // ← pass as totalMeds
          alarmsSet={alarmsSet}
        />

        <AIAssistantCard
          aiRecommendations={aiRecommendations}
          onPress={() => setShowAIChat(true)}
        />

        <AIRecommendationsSummary
          aiRecommendations={aiRecommendations}
          onClear={onClearAIRecommendations}
        />

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
  container:     { flex: 1, backgroundColor: '#f3f4f6' },
  bottomPadding: { height: 90 },
});