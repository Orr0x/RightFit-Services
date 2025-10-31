import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, typography } from '../../styles/tokens'
import { Button, ButtonProps } from './Button'

/**
 * EmptyState Component - React Native
 * STORY-002: Mobile Component Library
 */

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  primaryAction?: {
    label: string
    onPress: () => void
    icon?: React.ReactNode
  } & Partial<ButtonProps>
  secondaryAction?: {
    label: string
    onPress: () => void
  } & Partial<ButtonProps>
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}

      <Text style={styles.title}>{title}</Text>

      {description && <Text style={styles.description}>{description}</Text>}

      {(primaryAction || secondaryAction) && (
        <View style={styles.actions}>
          {primaryAction && (
            <Button
              variant="primary"
              onPress={primaryAction.onPress}
              leftIcon={primaryAction.icon}
              {...primaryAction}
            >
              {primaryAction.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="ghost"
              onPress={secondaryAction.onPress}
              {...secondaryAction}
            >
              {secondaryAction.label}
            </Button>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  icon: {
    marginBottom: spacing[4],
    opacity: 0.5,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    maxWidth: 300,
  },
  actions: {
    width: '100%',
    gap: spacing[2],
  },
})

export default EmptyState
