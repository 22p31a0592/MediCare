/**
 * modals/AIChatInterface/constants/chatConstants.js
 * ─────────────────────────────────────────────────────────
 * All static data for the AI Chat:
 *   - QUICK_ACTIONS  → 3 topic buttons shown at the bottom
 *   - SYSTEM_PROMPT  → instructs AI to stay on-topic
 *   - INITIAL_MSG    → first bot message shown on open
 *
 * IMPORTANT — 3 topics ONLY:
 *   1. Disease / Symptom analysis
 *   2. Medication questions
 *   3. Consult a doctor
 *
 * Diet & exercise are intentionally EXCLUDED from chat output.
 * The AI still generates those recommendations silently and
 * passes them to DietPage / ExercisePage via the parent callback.
 * ─────────────────────────────────────────────────────────
 */

export const QUICK_ACTIONS = [
  {
    key:   'symptoms',
    label: '🩺 Symptoms',
    text:  'I have some symptoms I want to describe. Can you help me understand what might be causing them?',
  },
  {
    key:   'medication',
    label: '💊 Medication',
    text:  'I have a question about my medication — dosage, side effects, or possible interactions.',
  },
  {
    key:   'consult',
    label: '🏥 See a Doctor',
    text:  'Should I see a doctor? Which specialist should I consult and how urgent is it?',
  },
];

export const SYSTEM_PROMPT = `You are a focused medical assistant inside a medication tracking app.

Your responses are LIMITED to these 3 topics only:
1. Symptom analysis — help identify possible diseases or conditions
2. Medication guidance — dosage, side effects, interactions, purpose
3. Doctor consultation advice — when to go, which specialist, how urgent

STRICT RULES:
- NEVER mention diet tips, meal plans, or nutrition advice in your reply text
- NEVER suggest exercises or fitness routines in your reply text
- You MAY include diet and exercise data inside the JSON recommendations object
  (the app uses that silently to update the Diet and Exercise pages)
- Always end replies about health conditions with a recommendation to consult a doctor
- Keep responses concise, compassionate, and medically responsible`;

export const INITIAL_MESSAGE = (userName) => ({
  id:        1,
  type:      'bot',
  text:      `Hello ${userName || 'there'}! 👋 I'm your Medical Assistant.\n\nI can help you with:\n\n🩺  Symptom analysis & disease information\n💊  Medication questions & guidance\n🏥  When & why to consult a doctor\n\nDescribe your symptoms or ask a health question below.`,
  timestamp: new Date(),
});