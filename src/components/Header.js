
//  * Header Component
//  * Top navigation bar with app title, user name, and reset button
//  * 
//  * @param {Object} user - User object with name property
//  * @param {Function} onEditName - Callback to edit user name
//  * @param {Function} onReset - Callback to reset all data
//  */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Pill, LogOut, Edit2 } from 'lucide-react-native';

export function Header({ user, onEditName, onReset }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Left Side - App Title and User Name */}
          <View>
            <View style={styles.titleRow}>
              <Pill size={28} color="#fff" />
              <Text style={styles.title}>MediTrack</Text>
            </View>
            {user && (
              <View style={styles.userRow}>
                <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
                <TouchableOpacity onPress={onEditName} style={styles.editButton}>
                  <Edit2 size={12} color="#dbeafe" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Right Side - Reset Button */}
          {user && (
            <TouchableOpacity onPress={onReset} style={styles.resetButton}>
              <LogOut size={16} color="#fff" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#3b82f6',
  },
  container: {
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: '#dbeafe',
  },
  editButton: {
    padding: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

