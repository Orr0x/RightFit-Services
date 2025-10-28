import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { useAuth } from '../../contexts/AuthContext'

export default function ProfileScreen() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      // Navigation will be handled automatically by RootNavigator when auth state changes
    } catch (error) {
      console.error('Logout error:', error)
      // Even if error occurs, user will be logged out locally
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>User profile and settings</Text>

      <Button mode="contained" onPress={handleLogout} style={styles.button}>
        Logout
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  button: {
    marginTop: 20,
  },
})
