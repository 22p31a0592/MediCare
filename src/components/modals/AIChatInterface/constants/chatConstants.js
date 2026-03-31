/**
 * modals/AIChatInterface/constants/chatConstants.js
 *
 * CHANGED:
 *  QUICK_ACTIONS now use exact backend symptom keywords
 *  (underscore format like chest_pain, high_fever) so the
 *  backend ML model recognises them correctly.
 */

export const QUICK_ACTIONS = [
  {
    key:   'heart',
    label: 'Diabetes',
    text:  'fatigue, weight_loss, restlessness, lethargy',
  },
  {
    key:   'fever',
    label: '🌡️ Fever',
    text:  'chills, vomiting, fatigue, high_fever',
  },
  {
    key:   'allergy',
    label: '🤧 Allergy',
    text:  'continuous_sneezing, shivering, chills, watering_from_eyes',
  },
  {
    key:   'cold',
    label: '🤒 Cold',
    text:  'continuous_sneezing, chills, fatigue, cough',
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
  text:
    `Hello ${userName || 'there'}! 👋 I'm your Medical Assistant.\n\n` +
    `I can help you with:\n\n` +
    `🩺  Symptom analysis & disease information\n` +
    `💊  Medication questions & guidance\n` +
    `🏥  When & why to consult a doctor\n\n` +
    `Describe your symptoms or tap a quick option below.\n` +
    `💡 Tip: Use underscores for multi-word symptoms\n` +
    `e.g. chest_pain, high_fever, watering_from_eyes`,
  timestamp: new Date(),
});