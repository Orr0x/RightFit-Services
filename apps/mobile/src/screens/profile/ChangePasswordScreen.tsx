import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native'
import { Input, Button } from '../../components/ui'
import { spacing, typography } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import { StackNavigationProp } from '@react-navigation/stack'
import api from '../../services/api'

type ChangePasswordScreenNavigationProp = StackNavigationProp<any, 'ChangePassword'>

interface Props {
  navigation: ChangePasswordScreenNavigationProp
}

/**
 * ChangePasswordScreen - Screen for changing user password
 * Dark Mode Support
 */
export default function ChangePasswordScreen({ navigation }: Props) {
  const colors = useThemeColors()
  const styles = createStyles(colors)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setSuccess(false)

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match")
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter')
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter')
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number')
      return
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Password must contain at least one special character')
      return
    }

    try {
      setLoading(true)
      await api.changePassword(currentPassword, newPassword, confirmPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack()
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Enter your current password and choose a new password. Your new password must be at
            least 8 characters and include uppercase, lowercase, number, and special characters.
          </Text>

          <Input
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
            autoCapitalize="none"
            required
            style={styles.input}
          />

          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
            autoCapitalize="none"
            required
            style={styles.input}
          />

          <Input
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            autoCapitalize="none"
            required
            style={styles.input}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? (
            <Text style={styles.successText}>Password changed successfully!</Text>
          ) : null}

          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || success}
            style={styles.button}
          >
            Change Password
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surfaceElevated,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      padding: spacing.lg,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
      lineHeight: 20,
    },
    input: {
      marginBottom: spacing.md,
    },
    errorText: {
      color: colors.error,
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    successText: {
      color: colors.success,
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.md,
      textAlign: 'center',
      fontWeight: typography.fontWeight.medium,
    },
    button: {
      marginTop: spacing.lg,
    },
  })
