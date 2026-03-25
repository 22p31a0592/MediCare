/**
 * screens/AlarmScreen.js
 *
 * Full-screen mandatory alarm UI.
 * Shown when an alarm fires — user MUST tap Taken or Snooze.
 * Back button is blocked. Cannot be dismissed.
 *
 * ── HOW IT IS TRIGGERED ──────────────────────────────────
 * When alarm fires → fullScreenAction launches MainActivity
 * → App.js detects notification via getInitialNotification()
 *   or onForegroundEvent → sets activeAlarm state
 * → AlarmScreen renders as a Modal over everything.
 *
 * ── PROPS ────────────────────────────────────────────────
 *  visible   boolean   — show/hide
 *  pill      object    — the pill that is ringing
 *  onTaken   function  — mark taken + dismiss
 *  onSnooze  function  — snooze 5 min + dismiss
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Animated, Easing, BackHandler, Dimensions,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

export function AlarmScreen({ visible, pill, onTaken, onSnooze }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;

  // Block hardware back button
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(60);
      return;
    }

    // Fade + slide up
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 8, useNativeDriver: true }),
    ]).start();

    // Bell pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.22, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Bell shake
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue:  10, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:   8, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  -8, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:   0, duration: 70, useNativeDriver: true }),
        Animated.delay(1500),
      ])
    ).start();
  }, [visible]);

  if (!pill) return null;

  const bellRotate = shakeAnim.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] });

  const alarmTimesList = pill.alarmTimes?.length > 0
    ? pill.alarmTimes
    : pill.alarmTime ? [pill.alarmTime] : [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>

          {/* Pulsing red ring */}
          <Animated.View style={[styles.bellRing, { transform: [{ scale: pulseAnim }] }]} />

          {/* Shaking bell */}
          <Animated.Text style={[styles.bell, { transform: [{ rotate: bellRotate }, { scale: pulseAnim }] }]}>
            🔔
          </Animated.Text>

          <Text style={styles.pillName}>{pill.name}</Text>
          <Text style={styles.dosage}>{pill.dosage}  ·  {pill.frequency}</Text>

          <View style={styles.timeChip}>
            <Text style={styles.timeChipText}>
              ⏰  {alarmTimesList.join('  ·  ')}  ·  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <Text style={styles.instruction}>
            Time to take your medication.{'\n'}
            You must respond to dismiss this alarm.
          </Text>

          <View style={styles.btnRow}>
            {/* Snooze */}
            <TouchableOpacity style={styles.snoozeBtn} onPress={onSnooze} activeOpacity={0.75}>
              <Text style={styles.snoozeBtnIcon}>⏰</Text>
              <Text style={styles.snoozeBtnTitle}>Snooze</Text>
              <Text style={styles.snoozeBtnSub}>5 minutes</Text>
            </TouchableOpacity>

            {/* Taken */}
            <TouchableOpacity style={styles.takenBtn} onPress={onTaken} activeOpacity={0.82}>
              <Text style={styles.takenBtnIcon}>✅</Text>
              <Text style={styles.takenBtnTitle}>I've Taken It</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️  This alarm cannot be dismissed without responding
            </Text>
          </View>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 28, padding: 28,
    width: SW - 40, maxWidth: 400, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4, shadowRadius: 32, elevation: 24,
  },
  bellRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#fee2e2', position: 'absolute', top: 18,
  },
  bell:     { fontSize: 52, marginTop: 24, marginBottom: 18 },
  pillName: { fontSize: 28, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  dosage:   { fontSize: 14, color: '#6b7280', marginBottom: 14 },
  timeChip: {
    backgroundColor: '#f3f4f6', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8, marginBottom: 18,
  },
  timeChipText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  instruction: {
    fontSize: 13, color: '#6b7280', textAlign: 'center',
    lineHeight: 20, marginBottom: 28,
  },
  btnRow: { flexDirection: 'row', gap: 14, width: '100%', marginBottom: 18, alignItems: 'stretch' },
  snoozeBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 18,
    backgroundColor: '#fffbeb', borderRadius: 18, borderWidth: 2, borderColor: '#fde68a', gap: 4,
  },
  snoozeBtnIcon:  { fontSize: 22 },
  snoozeBtnTitle: { fontSize: 14, fontWeight: '800', color: '#92400e' },
  snoozeBtnSub:   { fontSize: 11, color: '#b45309' },
  takenBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 22, backgroundColor: '#16a34a', borderRadius: 18, gap: 10,
    shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, elevation: 6,
  },
  takenBtnIcon:  { fontSize: 26 },
  takenBtnTitle: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  warning: {
    backgroundColor: '#fff7ed', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9, width: '100%',
    borderLeftWidth: 3, borderLeftColor: '#f59e0b',
  },
  warningText: { fontSize: 11, color: '#92400e', fontWeight: '600', textAlign: 'center' },
});