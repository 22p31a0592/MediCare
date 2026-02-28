/**
 * pages/DietPage/constants/dietData.js
 * ─────────────────────────────────────────────────────────
 * Generic diet tip sections shown when NO AI recommendations exist.
 * When AI recs are present, DietPage prepends an AI section to
 * this list so generic tips are still shown below as reference.
 * ─────────────────────────────────────────────────────────
 */

import { Apple, Leaf, Droplet, Utensils } from 'lucide-react-native';

export const GENERIC_DIET_SECTIONS = [
  {
    id:       'fruits',
    category: 'Fruits & Vegetables',
    icon:     Apple,
    color:    '#ef4444',
    bgColor:  '#fee2e2',
    tips: [
      'Eat 5 servings of fruits and vegetables daily',
      'Choose colourful produce for maximum nutrients',
      'Include leafy greens in every meal',
      'Fresh, frozen or canned — all count!',
    ],
  },
  {
    id:       'hydration',
    category: 'Hydration',
    icon:     Droplet,
    color:    '#3b82f6',
    bgColor:  '#dbeafe',
    tips: [
      'Drink 8 glasses of water daily',
      'Start your day with warm water',
      'Limit sugary drinks and sodas',
      'Herbal teas count towards hydration',
    ],
  },
  {
    id:       'meals',
    category: 'Balanced Meals',
    icon:     Utensils,
    color:    '#f59e0b',
    bgColor:  '#fef3c7',
    tips: [
      'Include protein in every meal',
      'Choose whole grains over refined',
      'Control portion sizes',
      "Don't skip breakfast",
    ],
  },
  {
    id:       'habits',
    category: 'Healthy Habits',
    icon:     Leaf,
    color:    '#10b981',
    bgColor:  '#d1fae5',
    tips: [
      'Eat slowly and mindfully',
      'Avoid eating late at night',
      'Limit processed foods',
      'Plan your meals in advance',
    ],
  },
];