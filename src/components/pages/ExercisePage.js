import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Dumbbell, Heart, Bike, Repeat, Timer, Sparkles, Brain, Activity } from 'lucide-react-native';

export function ExercisePage({ user, aiRecommendations, userHealthData }) {
  // Default exercise plans
  const defaultExercisePlans = [
    {
      id: 1,
      category: 'Cardio Exercises',
      icon: Heart,
      color: '#ef4444',
      bgColor: '#fee2e2',
      exercises: [
        { name: 'Brisk Walking', duration: '30 min', intensity: 'Low' },
        { name: 'Jogging', duration: '20 min', intensity: 'Medium' },
        { name: 'Cycling', duration: '25 min', intensity: 'Medium' },
        { name: 'Swimming', duration: '30 min', intensity: 'High' },
      ],
    },
    {
      id: 2,
      category: 'Strength Training',
      icon: Dumbbell,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      exercises: [
        { name: 'Push-ups', duration: '3 sets of 10', intensity: 'Medium' },
        { name: 'Squats', duration: '3 sets of 15', intensity: 'Medium' },
        { name: 'Lunges', duration: '3 sets of 12', intensity: 'Medium' },
        { name: 'Planks', duration: '3 sets of 30s', intensity: 'High' },
      ],
    },
    {
      id: 3,
      category: 'Flexibility & Balance',
      icon: Repeat,
      color: '#10b981',
      bgColor: '#d1fae5',
      exercises: [
        { name: 'Yoga', duration: '20 min', intensity: 'Low' },
        { name: 'Stretching', duration: '15 min', intensity: 'Low' },
        { name: 'Tai Chi', duration: '25 min', intensity: 'Low' },
        { name: 'Pilates', duration: '30 min', intensity: 'Medium' },
      ],
    },
  ];

  // Parse AI recommendations into exercise format
  const parseAIExercises = (recommendations) => {
    if (!recommendations || recommendations.length === 0) return [];
    
    return recommendations.map((rec, index) => ({
      name: rec,
      duration: 'As recommended',
      intensity: 'Custom',
    }));
  };

  const exercisePlans = [...defaultExercisePlans];
  
  if (aiRecommendations && aiRecommendations.exerciseRecommendations?.length > 0) {
    exercisePlans.unshift({
      id: 0,
      category: 'AI Personalized Exercise Plan',
      icon: Brain,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      exercises: parseAIExercises(aiRecommendations.exerciseRecommendations),
      isAI: true,
    });
  }

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      case 'Custom': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Dumbbell size={32} color="#fff" />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Fitness Guide</Text>
          <Text style={styles.headerSubtitle}>
            {aiRecommendations ? 'AI-Powered & General Plans' : 'Move more, feel better'}
          </Text>
        </View>
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Ready to Exercise, {user?.name || 'Champion'}? 💪</Text>
        <Text style={styles.welcomeText}>
          {aiRecommendations 
            ? `Based on your AI health analysis, here are personalized exercise recommendations tailored to your conditions, along with general fitness plans.`
            : `Regular physical activity is essential for maintaining good health. Start with exercises that match your fitness level.`
          }
        </Text>
      </View>

      {/* AI Analysis Badge */}
      {aiRecommendations && (
        <View style={styles.aiBadge}>
          <Sparkles size={20} color="#8b5cf6" />
          <View style={styles.aiBadgeContent}>
            <Text style={styles.aiBadgeTitle}>AI Fitness Plan Active</Text>
            <Text style={styles.aiBadgeText}>
              Customized for your health profile • 
              Confidence: {aiRecommendations.confidence || 0}%
            </Text>
          </View>
        </View>
      )}

      {/* Health Conditions Summary */}
      {userHealthData?.conditions && userHealthData.conditions.length > 0 && (
        <View style={styles.conditionsCard}>
          <Text style={styles.conditionsTitle}>⚠️ Exercise Considerations</Text>
          <Text style={styles.conditionsSubtitle}>
            Your exercise plan takes into account:
          </Text>
          {userHealthData.conditions.map((condition, index) => (
            <View key={index} style={styles.conditionItem}>
              <Activity size={14} color="#f59e0b" />
              <Text style={styles.conditionText}>{condition.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Exercise Plans */}
      {exercisePlans.map((plan) => {
        const IconComponent = plan.icon;
        return (
          <View key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={[styles.planIconBox, { backgroundColor: plan.bgColor }]}>
                <IconComponent size={24} color={plan.color} />
              </View>
              <View style={styles.planTitleContainer}>
                <Text style={styles.planTitle}>{plan.category}</Text>
                {plan.isAI && (
                  <View style={styles.aiLabel}>
                    <Sparkles size={12} color="#8b5cf6" />
                    <Text style={styles.aiLabelText}>AI Customized</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.exercisesContainer}>
              {plan.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.exerciseMeta}>
                      <Timer size={14} color="#6b7280" />
                      <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.intensityBadge,
                    { backgroundColor: getIntensityColor(exercise.intensity) + '20' }
                  ]}>
                    <Text style={[
                      styles.intensityText,
                      { color: getIntensityColor(exercise.intensity) }
                    ]}>
                      {exercise.intensity}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      {/* Tips Card */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Exercise Tips</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• Start slow and gradually increase intensity</Text>
          <Text style={styles.tipItem}>• Stay hydrated before, during, and after exercise</Text>
          <Text style={styles.tipItem}>• Warm up before and cool down after workouts</Text>
          <Text style={styles.tipItem}>• Listen to your body and rest when needed</Text>
          <Text style={styles.tipItem}>• Wear comfortable clothing and proper footwear</Text>
          {aiRecommendations && (
            <Text style={styles.tipItem}>• Follow AI recommendations based on your health profile</Text>
          )}
        </View>
      </View>

      {/* Warning Card */}
      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>⚠️ Important Safety Information</Text>
        <Text style={styles.warningText}>
          {aiRecommendations 
            ? 'These AI-generated exercise recommendations are based on symptom analysis. Always consult with your healthcare provider or physical therapist before starting any new exercise program, especially if you have existing health conditions, take medications, or experience pain during exercise.'
            : 'Always consult with your healthcare provider before starting any new exercise program, especially if you have existing health conditions or take medications.'
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
    backgroundColor: '#8b5cf6',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
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
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  conditionsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
  },
  conditionsSubtitle: {
    fontSize: 13,
    color: '#78350f',
    marginBottom: 10,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  planCard: {
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
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  planIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planTitleContainer: {
    flex: 1,
  },
  planTitle: {
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
  exercisesContainer: {
    gap: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseDuration: {
    fontSize: 13,
    color: '#6b7280',
  },
  intensityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#dbeafe',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
});