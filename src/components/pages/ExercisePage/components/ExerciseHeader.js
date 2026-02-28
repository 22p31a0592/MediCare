/**
 * pages/ExercisePage/components/ExerciseHeader.js
 * ─────────────────────────────────────────────────────────
 * Banner at top of ExercisePage.
 * Switches colour + icon when AI recs are active.
 * ─────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dumbbell, Brain } from 'lucide-react-native';

export function ExerciseHeader({ hasAI }) {
  return (
    <View style={[styles.header, hasAI && styles.headerAI]}>
      <View style={styles.iconBox}>
        {hasAI
          ? <Brain   size={30} color="#fff" />
          : <Dumbbell size={30} color="#fff" />
        }
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{hasAI ? 'Personalised Fitness' : 'Fitness Guide'}</Text>
        <Text style={styles.sub}>{hasAI ? 'Based on your health analysis' : 'Move more, feel better'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#7c3aed',
    margin: 12, marginBottom: 10,
    borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  headerAI: { backgroundColor: '#1d4ed8' },
  iconBox:  {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  text:  { flex: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 3 },
  sub:   { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
});