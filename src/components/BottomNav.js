import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, Apple, Dumbbell, User, Plus } from 'lucide-react-native';

export function BottomNav({ currentPage, onPageChange, onAddPill }) {
  const navItems = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'diet', label: 'Diet', Icon: Apple },
    { id: 'add', label: '', Icon: Plus },
    { id: 'exercise', label: 'Exercise', Icon: Dumbbell },
    { id: 'profile', label: 'Profile', Icon: User },
  ];

  const handlePress = (id) => {
    if (id === 'add') {
      onAddPill();
    } else {
      onPageChange(id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const isAddButton = item.id === 'add';

          if (isAddButton) {
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.addButtonContainer}
                onPress={() => handlePress(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.addButton}>
                  <item.Icon size={28} color="#fff" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => handlePress(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <item.Icon
                  size={22}
                  color={isActive ? '#3b82f6' : '#9ca3af'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  innerContainer: {
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: '#eff6ff',
  },
  label: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  labelActive: {
    color: '#3b82f6',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
  },
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 5,
    borderColor: '#fff',
  },
});