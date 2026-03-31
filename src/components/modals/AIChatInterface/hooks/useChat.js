/**
 * modals/AIChatInterface/hooks/useChat.js
 *
 * BUGS FIXED:
 *
 *  1. DISCONNECT AFTER FIRST MESSAGE:
 *     `throw new Error(res.data.error || 'Server error')` was firing
 *     even on successful responses because the backend does NOT return
 *     a `success` field — it returns { disease, confidence, medications… }.
 *     This threw an error → catch block ran → setConnectionStatus disconnected.
 *     Fix: removed the `!res.data.success` guard entirely. Only throw if
 *     the HTTP request itself failed (axios already throws for 4xx/5xx).
 *
 *  2. NULL DISEASE — "No disease found" message:
 *     When backend returns null/empty disease, show a helpful message
 *     telling the user to check their symptom spelling instead of
 *     crashing or showing a blank response.
 *
 *  3. setConnectionStatus(disconnected) in catch even when server replied:
 *     If server returns 200 with unexpected shape, we manually threw →
 *     catch ran → marked disconnected even though server was fine.
 *     Fix: only mark disconnected when err.response is absent (true network fail).
 *
 *  4. err.message.includes('Network') crashes if err.message is undefined.
 *     Fix: use err.message?.includes() safe call.
 */

import { useState }     from 'react';
import axios            from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import { SYSTEM_PROMPT, INITIAL_MESSAGE } from '../constants/chatConstants';

// ── Build bot reply text from backend disease response ──────────────────────
function buildBotText(data) {
  const disease     = data.disease     || null;
  const confidence  = data.confidence  ?? 0;
  const medications = toArray(data.medications);
  const precautions = toArray(data.precautions);

  // FIX 2: Handle null / empty disease from backend
  if (!disease || disease.trim() === '' || disease.toLowerCase() === 'unknown') {
    return (
      `🔍 No disease could be identified from the symptoms entered.\n\n` +
      `Please check:\n` +
      `  • Spelling of each symptom\n` +
      `  • Use underscores for multi-word symptoms\n` +
      `    e.g. chest_pain  high_fever  watering_from_eyes\n` +
      `  • Separate symptoms with commas\n\n` +
      `Try one of the quick buttons below, or re-enter your symptoms.`
    );
  }

  let text = `🔬 Based on your symptoms:\n\n`;
  text += `🩺 Predicted Condition: ${disease}\n`;
  text += `📊 Confidence: ${confidence}%\n\n`;

  if (medications.length > 0) {
    text += `💊 Recommended Medications:\n`;
    medications.forEach((m) => { text += `  • ${m}\n`; });
    text += '\n';
  }

  if (precautions.length > 0) {
    text += `🛡️ Precautions:\n`;
    precautions.forEach((p) => { text += `  • ${p}\n`; });
    text += '\n';
  }

  text += `ℹ️ Diet & exercise plans have been sent to your Diet and Exercise tabs.`;
  return text.trim();
}

function toArray(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.flatMap(parseItem).filter(Boolean);
  if (typeof raw === 'string') {
    if (raw.startsWith('[')) return parsePythonList(raw);
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseItem(item) {
  if (typeof item === 'string' && item.startsWith('[')) return parsePythonList(item);
  return [item];
}

function parsePythonList(str) {
  try {
    return JSON.parse(str.replace(/'/g, '"')).map((s) => String(s).trim());
  } catch {
    return str.replace(/[\[\]']/g, '').split(',').map((s) => s.trim()).filter(Boolean);
  }
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useChat({ userName, onRecommendationsGenerated, setConnectionStatus }) {
  const [messages,  setMessages]  = useState([INITIAL_MESSAGE(userName)]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping,  setIsTyping]  = useState(false);

  const sendMessage = async (overrideText) => {
    const text = (overrideText || inputText).trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), type: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/chat`,
        { message: text },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      setIsTyping(false);

      // FIX 1: Mark connected immediately after any successful HTTP response.
      // Do NOT check res.data.success — backend doesn't send that field.
      setConnectionStatus({ isConnected: true, testing: false, message: 'Connected' });

      const data = res.data ?? {};

      // FIX 2: Build bot text — handles null disease gracefully
      const botText = buildBotText(data);

      const botMsg = {
        id:            Date.now() + 1,
        type:          'bot',
        text:          botText,
        timestamp:     new Date(),
        hasConditions: !!(data.disease && data.disease.trim()),
      };
      setMessages((prev) => [...prev, botMsg]);

      // Pass recommendations silently to Diet/Exercise tabs
      if (onRecommendationsGenerated) {
        const diet     = toArray(data.ai_suggestions?.diet     ?? data.recommendations?.diet);
        const exercise = toArray(data.ai_suggestions?.exercise ?? data.recommendations?.exercise);

        onRecommendationsGenerated({
          symptoms:                text.split(',').map((s) => s.trim()),
          conditions:              data.disease ? [{ name: data.disease }] : [],
          dietRecommendations:     diet,
          exerciseRecommendations: exercise,
          chatHistory:             [...messages, userMsg, botMsg],
          confidence:              data.confidence || 0,
          timestamp:               new Date().toISOString(),
        });
      }

    } catch (err) {
      setIsTyping(false);

      // FIX 3: Only mark disconnected on real network failure (no err.response)
      // If server replied with 4xx/5xx, we're still connected — just got an error.
      const serverReplied = !!err.response;
      setConnectionStatus({
        isConnected: serverReplied,
        testing:     false,
        message:     serverReplied ? 'Server issue' : 'Disconnected',
      });

      // FIX 4: Safe error message building
      let errText = '⚠️ Error\n\n';

      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        errText += 'Request timed out.\nCheck your server is running.';

      } else if (!serverReplied) {
        errText +=
          `Cannot reach server at:\n${API_BASE_URL}\n\n` +
          `Make sure your Python server is running.\nCommand: python app.py`;

      } else {
        const status  = err.response.status;
        const resData = err.response.data;
        const msg     = typeof resData === 'string'
          ? resData
          : (resData?.error || resData?.message || resData?.detail || err.message || 'Unknown error');

        if (status === 400)      errText += `Bad request: ${msg}`;
        else if (status === 404) errText += `Endpoint not found (404).\nExpected: POST /api/chat`;
        else if (status === 500) errText += `Server error (500).\n${msg}\nCheck your Python terminal.`;
        else                     errText += `Server returned ${status}: ${msg}`;
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: errText, timestamp: new Date(), isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, inputText, setInputText, isLoading, isTyping, sendMessage };
}