import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Button } from '../../components/ui'
import { colors, spacing, typography } from '../../styles/tokens'
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

      <Button
        variant="primary"
        size="lg"
        onPress={handleLogout}
        style={styles.button}
      >
        Logout
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.surfaceElevated,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  button: {
    marginTop: spacing.lg,
  },
})
