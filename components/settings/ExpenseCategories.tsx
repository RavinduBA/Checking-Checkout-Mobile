import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExpenseCategories() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expense Categories</Text>
        <Text style={styles.subtitle}>
          Manage your expense categories and classifications.
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Coming Soon</Text>
        <Text style={styles.description}>
          This feature will allow you to create and manage expense categories 
          for better financial tracking and reporting.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
