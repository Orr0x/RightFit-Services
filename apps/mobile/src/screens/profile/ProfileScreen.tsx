import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Button } from '../../components/ui'
import { spacing, typography } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useAuth } from '../../contexts/AuthContext'
import { StackNavigationProp } from '@react-navigation/stack'
import { ProfileStackParamList } from '../../types'

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileMain'>

interface Props {
  navigation: ProfileScreenNavigationProp
}

/**
 * ProfileScreen - User profile and settings screen
 * STORY-005: Dark Mode Support
 */
export default function ProfileScreen({ navigation }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <Button
          variant="secondary"
          size="md"
          onPress={() => navigation.navigate('ChangePassword')}
          style={styles.button}
        >
          Change Password
        </Button>
      </View>

      <Button
        variant="primary"
        size="lg"
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </View>
  )
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
      backgroundColor: colors.surfaceElevated,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.fontSize.md,
      color: colors.textSecondary,
      marginBottom: spacing.xl,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    button: {
      marginTop: 0,
    },
    logoutButton: {
      marginTop: spacing.xl,
    },
  })
