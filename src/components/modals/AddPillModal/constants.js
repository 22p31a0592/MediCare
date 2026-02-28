/**
 * modals/AddPillModal/constants.js
 * ─────────────────────────────────────────────────────────
 * Static data used by AddPillModal.
 * Extracting constants keeps the main modal file clean.
 * ─────────────────────────────────────────────────────────
 */

export const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
];

export const ALARM_TONES = [
  { label: 'Default Ringtone', value: 'default' },
  { label: 'Classic Alarm',    value: 'alarm_classic' },
  { label: 'Gentle Bell',      value: 'alarm_gentle' },
  { label: 'Digital Beep',     value: 'alarm_digital' },
  { label: 'Melody',           value: 'alarm_melody' },
];