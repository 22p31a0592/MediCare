import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Apple, Leaf, Droplet, Utensils, Sparkles, Brain } from 'lucide-react-native';

export function DietPage({ user, aiRecommendations, userHealthData }) {
  // Default diet tips
  const defaultDietTips = [
    {
      id: 1,
      category: 'Fruits & Vegetables',
      icon: Apple,
      color: '#ef4444',
      bgColor: '#fee2e2',
      tips: [
        'Eat 5 servings of fruits and vegetables daily',
        'Choose colorful produce for maximum nutrients',
        'Include leafy greens in every meal',
        'Fresh, frozen or canned - all count!',
      ],
    },
    {
      id: 2,
      category: 'Hydration',
      icon: Droplet,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      tips: [
        'Drink 8 glasses of water daily',
        'Start your day with warm water',
        'Limit sugary drinks and sodas',
        'Herbal teas count towards hydration',
      ],
    },
    {
      id: 3,
      category: 'Balanced Meals',
      icon: Utensils,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      tips: [
        'Include protein in every meal',
        'Choose whole grains over refined',
        'Control portion sizes',
        'Don\'t skip breakfast',
      ],
    },
    {
      id: 4,
      category: 'Healthy Habits',
      icon: Leaf,
      color: '#10b981',
      bgColor: '#d1fae5',
      tips: [
        'Eat slowly and mindfully',
        'Avoid eating late at night',
        'Limit processed foods',
        'Plan your meals in advance',
      ],
    },
  ];

  // If AI recommendations exist, add them as a new section
  const dietTips = [...defaultDietTips];
  
  if (aiRecommendations && aiRecommendations.dietRecommendations?.length > 0) {
    dietTips.unshift({
      id: 0,
      category: 'AI Personalized Recommendations',
      icon: Brain,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      tips: aiRecommendations.dietRecommendations,
      isAI: true,
    });
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Apple size={32} color="#fff" />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nutrition Guide</Text>
          <Text style={styles.headerSubtitle}>
            {aiRecommendations ? 'AI-Powered & General Tips' : 'Eat well, live better'}
          </Text>
        </View>
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Hello {user?.name || 'there'}! 👋</Text>
        <Text style={styles.welcomeText}>
          {aiRecommendations 
            ? `Based on your AI health analysis, here are personalized nutrition recommendations along with general healthy eating tips.`
            : `A balanced diet is key to good health. Here are some personalized nutrition tips for you.`
          }
        </Text>
      </View>

      {/* AI Analysis Badge */}
      {aiRecommendations && (
        <View style={styles.aiBadge}>
          <Sparkles size={20} color="#8b5cf6" />
          <View style={styles.aiBadgeContent}>
            <Text style={styles.aiBadgeTitle}>AI Analysis Active</Text>
            <Text style={styles.aiBadgeText}>
              Confidence: {aiRecommendations.confidence || 0}% • 
              {userHealthData?.conditions?.length || 0} conditions detected
            </Text>
          </View>
        </View>
      )}

      {/* Conditions Summary */}
      {userHealthData?.conditions && userHealthData.conditions.length > 0 && (
        <View style={styles.conditionsCard}>
          <Text style={styles.conditionsTitle}>🩺 Your Health Conditions</Text>
          {userHealthData.conditions.map((condition, index) => (
            <View key={index} style={styles.conditionTag}>
              <Text style={styles.conditionTagText}>{condition.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Diet Tips Sections */}
      {dietTips.map((section) => {
        const IconComponent = section.icon;
        return (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBox, { backgroundColor: section.bgColor }]}>
                <IconComponent size={24} color={section.color} />
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{section.category}</Text>
                {section.isAI && (
                  <View style={styles.aiLabel}>
                    <Sparkles size={12} color="#8b5cf6" />
                    <Text style={styles.aiLabelText}>AI Generated</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.tipsContainer}>
              {section.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={[styles.tipBullet, { backgroundColor: section.color }]} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      {/* Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>⚕️ Important Note</Text>
        <Text style={styles.disclaimerText}>
          {aiRecommendations 
            ? 'AI recommendations are based on symptom analysis and general health data. For personalized nutrition advice specific to your medical conditions, please consult with a registered dietitian or healthcare provider.'
            : 'These are general dietary guidelines. For personalized nutrition advice, please consult with a registered dietitian or healthcare provider.'
          }
        </Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  welcomeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  aiBadge: {
    backgroundColor: '#ede9fe',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  aiBadgeContent: {
    flex: 1,
  },
  aiBadgeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5b21b6',
    marginBottom: 4,
  },
  aiBadgeText: {
    fontSize: 12,
    color: '#6d28d9',
  },
  conditionsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  conditionsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  conditionTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  conditionTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
  },
  sectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  aiLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  disclaimerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
});