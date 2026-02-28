import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

export function Section({ title, items, color }){
    const colorMap={
        green: '#10b981',
        blue: '#3b82f6',
        red: '#ef4444',
        orange: '#f97316',
        purple: '#a855f7',
        teal: '#14b8a6'
    };

    return(
        <View style={styles.container}>
            <View style={[styles.header, {backgroundColor : colorMap[color]}]}>
                <Text style={styles.title}>{title}</Text>
            </View>
            
            <View style={styles.content}>
                {items.map((item,idx) => (
                    <View key={idx} style={styles.item}>
                        <Text style={styles.icon}>{item.icon}</Text>
                        <View style={styles.textContainer}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemDesc}>{item.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android shadow
    elevation: 5,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 24,
  },
  item: {
    flexDirection: 'row', // Horizontal layout
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  textContainer: {
    flex: 1, // Take remaining space
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
});
