/**
 * pages/ExercisePage/constants/exerciseData.js
 * ─────────────────────────────────────────────────────────
 * Generic exercise plans shown when NO AI recommendations exist.
 * When AI recs are present, ExercisePage prepends an AI plan
 * and keeps these below as general reference.
 * ─────────────────────────────────────────────────────────
 */

import { Heart, Dumbbell, Repeat } from 'lucide-react-native';

export const INTENSITY_COLORS = {
  Low:    '#10b981',
  Medium: '#f59e0b',
  High:   '#ef4444',
  Custom: '#7c3aed',
};

export const GENERIC_EXERCISE_PLANS = [
  {
    id:       'cardio',
    category: 'Cardio Exercises',
    icon:     Heart,
    color:    '#ef4444',
    bgColor:  '#fee2e2',
    exercises: [
      { name: 'Brisk Walking', duration: '30 min', intensity: 'Low'    },
      { name: 'Jogging',       duration: '20 min', intensity: 'Medium' },
      { name: 'Cycling',       duration: '25 min', intensity: 'Medium' },
      { name: 'Swimming',      duration: '30 min', intensity: 'High'   },
    ],
  },
  {
    id:       'strength',
    category: 'Strength Training',
    icon:     Dumbbell,
    color:    '#7c3aed',
    bgColor:  '#ede9fe',
    exercises: [
      { name: 'Push-ups',  duration: '3 sets of 10',  intensity: 'Medium' },
      { name: 'Squats',    duration: '3 sets of 15',  intensity: 'Medium' },
      { name: 'Lunges',    duration: '3 sets of 12',  intensity: 'Medium' },
      { name: 'Planks',    duration: '3 sets of 30s', intensity: 'High'   },
    ],
  },
  {
    id:       'flex',
    category: 'Flexibility & Balance',
    icon:     Repeat,
    color:    '#10b981',
    bgColor:  '#d1fae5',
    exercises: [
      { name: 'Yoga',       duration: '20 min', intensity: 'Low'    },
      { name: 'Stretching', duration: '15 min', intensity: 'Low'    },
      { name: 'Tai Chi',    duration: '25 min', intensity: 'Low'    },
      { name: 'Pilates',    duration: '30 min', intensity: 'Medium' },
    ],
  },
];

export const GENERAL_TIPS = [
  'Start slow and gradually increase intensity',
  'Stay hydrated before, during and after exercise',
  'Warm up before and cool down after workouts',
  'Listen to your body and rest when needed',
  'Wear comfortable clothing and proper footwear',
];