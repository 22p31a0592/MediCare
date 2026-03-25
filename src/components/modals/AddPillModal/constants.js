/**
 * modals/AddPillModal/constants.js
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

/** How many alarm time pickers to show for each frequency */
export const FREQUENCY_ALARM_COUNT = {
  'Once daily':        1,
  'Twice daily':       2,
  'Three times daily': 3,
  'Every 6 hours':     4,
  'Every 8 hours':     3,
  'Every 12 hours':    2,
  'As needed':         1,
};

export const ALARM_TONES = [
  { label: 'Default Ringtone', value: 'default'       },
  { label: 'Classic Alarm',    value: 'alarm_classic'  },
  { label: 'Gentle Bell',      value: 'alarm_gentle'   },
  { label: 'Digital Beep',     value: 'alarm_digital'  },
  { label: 'Melody',           value: 'alarm_melody'   },
];

/**
 * Build evenly-spaced default Date objects for N alarm slots.
 *   count=1 → [8:00 AM]
 *   count=2 → [8:00 AM, 8:00 PM]
 *   count=3 → [8:00 AM, 2:00 PM, 8:00 PM]
 *   count=4 → [6:00 AM, 12:00 PM, 6:00 PM, 12:00 AM]
 */
export function buildDefaultAlarmTimes(count) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setHours(Math.round((i * 24) / count) % 24, 0, 0, 0);
    return d;
  });
}