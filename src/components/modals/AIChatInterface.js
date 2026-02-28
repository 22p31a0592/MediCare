import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Brain, Send, User, Bot, AlertCircle, CheckCircle2, X, Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import axios from 'axios';

// Import smart configuration
import { API_BASE_URL, testConnection } from '../../config/api';

export function AIChatInterface({ onClose, onRecommendationsGenerated, userName }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `Hello ${userName || 'there'}! 👋 I'm your AI health assistant.\n\n📡 Connected to: ${API_BASE_URL}\n\nI can help you with:\n• Symptom analysis\n• Diet recommendations\n• Exercise suggestions\n• Health questions\n\nWhat would you like to discuss today?`,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    testing: true,
    message: 'Testing connection...',
  });
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  // Test connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus({ isConnected: false, testing: true, message: 'Testing connection...' });
    
    try {
      console.log('🧪 Testing connection to:', API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/api/health`, {
        timeout: 5000,
      });
      
      if (response.data.success) {
        console.log('✅ Connection successful!');
        setConnectionStatus({
          isConnected: true,
          testing: false,
          message: 'Connected',
        });
      }
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      
      let errorMessage = 'Connection failed';
      let suggestions = [];
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout';
        suggestions = ['Server is slow', 'Check your internet'];
      } else if (error.message.includes('Network Error') || error.message.includes('Network request failed')) {
        errorMessage = 'Cannot reach server';
        suggestions = [
          Platform.OS === 'android' ? 'Use http://10.0.2.2:5000 for emulator' : 'Use http://localhost:5000 for simulator',
          'Make sure Python server is running',
          'Check if both on same WiFi (for real device)',
        ];
      } else {
        errorMessage = error.message;
      }
      
      setConnectionStatus({
        isConnected: false,
        testing: false,
        message: errorMessage,
      });
      
      // Show alert with troubleshooting
      Alert.alert(
        '⚠️ Connection Error',
        `Cannot connect to backend:\n${API_BASE_URL}\n\n${suggestions.join('\n')}`,
        [
          { text: 'Retry', onPress: checkConnection },
          { text: 'Continue Anyway', style: 'cancel' }
        ]
      );
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      console.log('📤 Sending message to:', `${API_BASE_URL}/api/chat`);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/chat`,
        {
          message: userMessage.text,
          conversation_history: messages
            .filter(m => m.type !== 'system') // Exclude system messages
            .map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
          analyze_symptoms: true,
          generate_recommendations: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log('📥 Response received');
      setIsTyping(false);
      
      // Update connection status
      setConnectionStatus({
        isConnected: true,
        testing: false,
        message: 'Connected',
      });

      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: response.data.response,
          timestamp: new Date(),
          recommendations: response.data.recommendations || null,
          confidence: response.data.confidence || null,
        };

        setMessages(prev => [...prev, botMessage]);

        // If AI generated recommendations, pass them to parent
        if (response.data.recommendations) {
          const recommendations = {
            symptoms: response.data.symptoms || [],
            conditions: response.data.conditions || [],
            dietRecommendations: response.data.recommendations.diet || [],
            exerciseRecommendations: response.data.recommendations.exercise || [],
            chatHistory: [...messages, userMessage, botMessage],
            confidence: response.data.confidence || 0,
            timestamp: new Date().toISOString(),
          };

          if (onRecommendationsGenerated) {
            onRecommendationsGenerated(recommendations);
          }
        }
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      setIsTyping(false);
      
      // Update connection status
      setConnectionStatus({
        isConnected: false,
        testing: false,
        message: 'Disconnected',
      });
      
      let errorText = '⚠️ I encountered an error:\n\n';
      
      if (error.code === 'ECONNABORTED') {
        errorText += 'Request timeout - the server took too long to respond.';
      } else if (error.message.includes('Network Error') || error.message.includes('Network request failed')) {
        errorText += `Cannot reach the server at:\n${API_BASE_URL}\n\nPlease check:\n✓ Python server is running\n✓ Same WiFi network (for real device)\n✓ Correct IP address in config`;
      } else if (error.response) {
        errorText += `Server error: ${error.response.status}\n${error.response.data?.error || error.message}`;
      } else {
        errorText += error.message;
      }

      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: errorText,
        timestamp: new Date(),
        isError: true,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message) => {
    const isBot = message.type === 'bot';
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isBot ? styles.botMessageContainer : styles.userMessageContainer,
        ]}
      >
        {isBot && (
          <View style={styles.botAvatar}>
            <Bot size={16} color="#fff" />
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isBot ? styles.botBubble : styles.userBubble,
            message.isError && styles.errorBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isBot ? styles.botText : styles.userText,
            ]}
          >
            {message.text}
          </Text>

          {message.recommendations && (
            <View style={styles.recommendationsBadge}>
              <CheckCircle2 size={14} color="#10b981" />
              <Text style={styles.recommendationsBadgeText}>
                Recommendations generated ✓
              </Text>
            </View>
          )}

          {message.confidence && (
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                Confidence: {message.confidence}%
              </Text>
            </View>
          )}

          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {!isBot && (
          <View style={styles.userAvatar}>
            <User size={16} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Brain size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
            <View style={styles.statusRow}>
              {connectionStatus.isConnected ? (
                <Wifi size={12} color="#10b981" />
              ) : (
                <WifiOff size={12} color="#ef4444" />
              )}
              <Text style={styles.headerSubtitle}>
                {isTyping ? 'Typing...' : connectionStatus.message}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={checkConnection} 
            style={styles.refreshButton}
            disabled={connectionStatus.testing}
          >
            <RefreshCw size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection Status Banner */}
      {!connectionStatus.isConnected && !connectionStatus.testing && (
        <TouchableOpacity 
          style={styles.connectionBanner}
          onPress={checkConnection}
        >
          <View style={styles.connectionBannerLeft}>
            <AlertCircle size={16} color="#dc2626" />
            <Text style={styles.connectionBannerText}>
              Not connected to backend
            </Text>
          </View>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      )}

      {/* API Info Banner (helpful for debugging) */}
      {__DEV__ && (
        <View style={styles.debugBanner}>
          <Text style={styles.debugText}>
            🔧 Backend: {API_BASE_URL}
          </Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}

        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.botAvatar}>
              <Bot size={16} color="#fff" />
            </View>
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type your message or describe symptoms..."
            placeholderTextColor="#9ca3af"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setInputText('I have a headache and feel tired')}
            disabled={isLoading}
          >
            <Text style={styles.quickActionText}>💊 Symptoms</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setInputText('What should I eat for better health?')}
            disabled={isLoading}
          >
            <Text style={styles.quickActionText}>🥗 Diet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setInputText('What exercises do you recommend?')}
            disabled={isLoading}
          >
            <Text style={styles.quickActionText}>💪 Exercise</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButton: {
    padding: 8,
  },
  connectionBanner: {
    backgroundColor: '#fee2e2',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ef4444',
  },
  connectionBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  connectionBannerText: {
    fontSize: 13,
    color: '#991b1b',
    fontWeight: '500',
  },
  retryText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  debugBanner: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fbbf24',
  },
  debugText: {
    fontSize: 11,
    color: '#92400e',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: '#1f2937',
  },
  userText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  recommendationsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  recommendationsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  confidenceBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e40af',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b5cf6',
    opacity: 0.6,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
});