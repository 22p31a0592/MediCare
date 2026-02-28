/**
 * modals/AIChatInterface/hooks/useChat.js
 * ─────────────────────────────────────────────────────────
 * Custom hook: manages all chat message state and the
 * sendMessage function.
 *
 * KEY RULE: diet & exercise recommendations are passed
 * silently to the parent via onRecommendationsGenerated.
 * They are NEVER added to the messages array shown in chat.
 * ─────────────────────────────────────────────────────────
 */

import { useState }     from 'react';
import axios            from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { SYSTEM_PROMPT, INITIAL_MESSAGE } from '../constants/chatConstants';

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
        {
          message:        text,
          system_prompt:  SYSTEM_PROMPT,
          conversation_history: messages
            .filter((m) => m.type !== 'system')
            .map((m) => ({
              role:    m.type === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
          analyze_symptoms:         true,
          generate_recommendations: true, // generated but NOT shown in chat
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      setIsTyping(false);
      setConnectionStatus({ isConnected: true, testing: false, message: 'Connected' });

      if (!res.data.success) throw new Error(res.data.error || 'Server error');

      // ── Bot message — disease/medication text only ─────
      const botMsg = {
        id:            Date.now() + 1,
        type:          'bot',
        text:          res.data.response,
        timestamp:     new Date(),
        hasConditions: !!(res.data.conditions?.length),
      };
      setMessages((prev) => [...prev, botMsg]);

      // ── Pass recs silently to parent (Diet/Exercise tabs) ─
      // These are NEVER displayed inside this chat interface.
      if (res.data.recommendations && onRecommendationsGenerated) {
        onRecommendationsGenerated({
          symptoms:               res.data.symptoms                  || [],
          conditions:             res.data.conditions                || [],
          dietRecommendations:    res.data.recommendations.diet      || [],
          exerciseRecommendations: res.data.recommendations.exercise || [],
          chatHistory:            [...messages, userMsg, botMsg],
          confidence:             res.data.confidence                || 0,
          timestamp:              new Date().toISOString(),
        });
      }
    } catch (err) {
      setIsTyping(false);
      setConnectionStatus({ isConnected: false, testing: false, message: 'Disconnected' });

      let errText = '⚠️ Error:\n\n';
      if (err.code === 'ECONNABORTED') {
        errText += 'Request timed out.';
      } else if (err.message.includes('Network')) {
        errText += `Cannot reach server at:\n${API_BASE_URL}\n\nCheck if Python server is running.`;
      } else if (err.response) {
        errText += `Server error ${err.response.status}: ${err.response.data?.error || err.message}`;
      } else {
        errText += err.message;
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: errText, timestamp: new Date(), isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages, inputText, setInputText,
    isLoading, isTyping,
    sendMessage,
  };
}