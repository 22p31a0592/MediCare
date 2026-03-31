/**
 * modals/AlarmAlertModal.js
 * ─────────────────────────────────────────────────────────
 * Mandatory full-screen alarm dialog — shown in the MIDDLE
 * of the screen. User CANNOT ignore it. Must tap Taken or Snooze.
 *
 * ── HOW THE FULL FLOW WORKS ──────────────────────────────
 *
 *  1. Alarm fires (AlarmManager.setAlarmClock)
 *  2. fullScreenAction wakes screen + launches MainActivity
 *  3. App.js calls notifee.getInitialNotification()
 *     → finds notification with data.type === 'alarm'
 *     → sets activeAlarm state with the pill object
 *  4. This modal renders over EVERYTHING (transparent Modal)
 *  5. Android back button is blocked (BackHandler)
 *  6. User taps "Taken" → pill marked, alarm cancelled
 *     User taps "Snooze" → alarm re-fires in 5 min
 *
 * ── HOW TO ADD TO App.js ─────────────────────────────────
 *
 *  import { AlarmAlertModal }    from './modals/AlarmAlertModal';
 *  import notifee, { EventType } from '@notifee/react-native';
 *  import notificationService    from './services/NotificationService';
 *
 *  // 1. State
 *  const [activeAlarm, setActiveAlarm] = useState(null);
 *
 *  // 2. Detect alarm on startup (app was launched by alarm)
   useEffect(() => {
     notifee.getInitialNotification().then((initial) => {
       if (initial?.notification?.data?.type === 'alarm') {
         setActiveAlarm(JSON.parse(initial.notification.data.pill));
       }
     });
 *
     // 3. Detect alarm while app is already open
     const unsub = notifee.onForegroundEvent(({ type, detail }) => {
       if (
         type === EventType.DELIVERED &&
         detail.notification?.data?.type === 'alarm'
       ) {
         setActiveAlarm(JSON.parse(detail.notification.data.pill));
       }
     });
     return unsub;
   }, []);
 *
 *  // 4. In JSX (place OUTSIDE ScrollView, at root level):
   <AlarmAlertModal
     visible={!!activeAlarm}
     pill={activeAlarm}
     onTaken={async () => {
       await handleMarkPillTaken(activeAlarm._id);  // your existing handler
       await notificationService.cancelAlarm(activeAlarm._id);
       setActiveAlarm(null);
     }}
     onSnooze={async () => {
       await notificationService.snoozeAlarm(activeAlarm);
       setActiveAlarm(null);
     }}
   />
 * ─────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  BackHandler,
  Dimensions,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

export function AlarmAlertModal({ visible, pill, onTaken, onSnooze }) {
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(60)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  // ── Block hardware back button ────────────────────────
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [visible]);

  // ── Run animations when modal opens ──────────────────
  useEffect(() => {
    if (!visible) {
      // Reset on close
      pulseAnim.setValue(1);
      shakeAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(60);
      glowAnim.setValue(0);
      return;
    }

    // Fade + slide card up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 280, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 55, friction: 8, useNativeDriver: true,
      }),
    ]).start();

    // Bell ring pulse (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2, duration: 500,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0, duration: 500,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
      ])
    ).start();

    // Bell shake (every 1.5s)
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue:  10, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:   8, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  -8, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:   0, duration: 70, useNativeDriver: true }),
        Animated.delay(1400),
      ])
    ).start();

    // Red glow pulse on the taken button
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    ).start();
  }, [visible]);

  if (!pill) return null;

  const bellRotation = shakeAnim.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  const takenShadow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 14],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}} // blocks modal-level back
    >
      {/* ── Dark overlay ─────────────────────────────── */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>

        {/* ── Card ─────────────────────────────────────── */}
        <Animated.View style={[
          styles.card,
          { transform: [{ translateY: slideAnim }] },
        ]}>

          {/* Red pulse ring behind bell */}
          <Animated.View style={[
            styles.bellRing,
            { transform: [{ scale: pulseAnim }] },
          ]} />

          {/* Bell icon */}
          <Animated.Text style={[
            styles.bellEmoji,
            { transform: [{ rotate: bellRotation }, { scale: pulseAnim }] },
          ]}>
            🔔
          </Animated.Text>

          {/* Pill name */}
          <Text style={styles.pillName}>{pill.name}</Text>
          <Text style={styles.dosage}>{pill.dosage}  ·  {pill.frequency}</Text>

          {/* Time */}
          <View style={styles.timeChip}>
            <Text style={styles.timeChipText}>
              ⏰  {pill.alarmTime}  ·  {new Date().toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>

          <Text style={styles.instruction}>
            Time to take your medication.{'\n'}
            Tap a button below — this alarm cannot be ignored.
          </Text>

          {/* ── Action buttons ──────────────────────── */}
          <View style={styles.btnRow}>

            {/* Snooze */}
            <TouchableOpacity
              style={styles.snoozeBtn}
              onPress={onSnooze}
              activeOpacity={0.75}
            >
              <Text style={styles.snoozeBtnIcon}>⏰</Text>
              <Text style={styles.snoozeBtnTitle}>Snooze</Text>
              <Text style={styles.snoozeBtnSub}>5 minutes</Text>
            </TouchableOpacity>

            {/* Taken — primary */}
            <Animated.View style={[
              styles.takenBtnShadow,
              { shadowRadius: takenShadow, elevation: takenShadow },
            ]}>
              <TouchableOpacity
                style={styles.takenBtn}
                onPress={onTaken}
                activeOpacity={0.82}
              >
                <Text style={styles.takenBtnIcon}>✅</Text>
                <Text style={styles.takenBtnTitle}>I've Taken It</Text>
              </TouchableOpacity>
            </Animated.View>

          </View>

          {/* Warning */}
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️  You must respond to dismiss this alarm
            </Text>
          </View>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent:  'center',
    alignItems:      'center',
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius:    28,
    padding:         28,
    width:           SW - 40,
    maxWidth:        400,
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 16 },
    shadowOpacity:   0.4,
    shadowRadius:    32,
    elevation:       24,
  },

  // Bell
  bellRing: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: '#fee2e2',
    position:        'absolute',
    top:             18,
  },
  bellEmoji: {
    fontSize:     52,
    marginTop:    24,
    marginBottom: 18,
  },

  // Text
  pillName: {
    fontSize:     28,
    fontWeight:   '800',
    color:        '#111827',
    textAlign:    'center',
    marginBottom: 6,
  },
  dosage: {
    fontSize:     14,
    color:        '#6b7280',
    marginBottom: 14,
  },
  timeChip: {
    backgroundColor:   '#f3f4f6',
    borderRadius:      12,
    paddingHorizontal: 16,
    paddingVertical:   8,
    marginBottom:      18,
  },
  timeChipText: {
    fontSize:   13,
    fontWeight: '700',
    color:      '#374151',
  },
  instruction: {
    fontSize:     13,
    color:        '#6b7280',
    textAlign:    'center',
    lineHeight:   20,
    marginBottom: 28,
  },

  // Buttons
  btnRow: {
    flexDirection:  'row',
    gap:            14,
    width:          '100%',
    marginBottom:   18,
    alignItems:     'stretch',
  },

  // Snooze
  snoozeBtn: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: '#fffbeb',
    borderRadius:   18,
    borderWidth:    2,
    borderColor:    '#fde68a',
    gap:            4,
  },
  snoozeBtnIcon:  { fontSize: 24 },
  snoozeBtnTitle: { fontSize: 14, fontWeight: '800', color: '#92400e' },
  snoozeBtnSub:   { fontSize: 11, color: '#b45309' },

  // Taken
  takenBtnShadow: {
    flex:        2,
    borderRadius: 18,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
  },
  takenBtn: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            10,
    paddingVertical: 22,
    backgroundColor: '#16a34a',
    borderRadius:   18,
  },
  takenBtnIcon:  { fontSize: 26 },
  takenBtnTitle: {
    fontSize:   18,
    fontWeight: '900',
    color:      '#fff',
    letterSpacing: -0.3,
  },

  // Warning
  warning: {
    backgroundColor:   '#fff7ed',
    borderRadius:      10,
    paddingHorizontal: 14,
    paddingVertical:   9,
    width:             '100%',
    borderLeftWidth:   3,
    borderLeftColor:   '#f59e0b',
  },
  warningText: {
    fontSize:   11,
    color:      '#92400e',
    fontWeight: '600',
    textAlign:  'center',
  },
});