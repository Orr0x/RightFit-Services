import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { spacing, borderRadius, shadows } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'

/**
 * Card Component - React Native
 * STORY-002: Mobile Component Library
 * STORY-005: Dark Mode Support
 */

export type CardVariant = 'outlined' | 'elevated' | 'filled'

export interface CardProps {
  children: React.ReactNode
  variant?: CardVariant
  padding?: keyof typeof spacing
  style?: ViewStyle
  testID?: string
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    card: {
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
    },
    cardOutlined: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardElevated: {
      ...shadows.md,
    },
    cardFilled: {
      backgroundColor: colors.surfaceElevated,
    },
  })

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'outlined',
  padding = 4,
  style,
  testID,
}) => {
  const colors = useThemeColors()
  const styles = createStyles(colors)

  const cardStyles: ViewStyle[] = [
    styles.card,
    { padding: spacing[padding] },
    variant === 'outlined' && styles.cardOutlined,
    variant === 'elevated' && styles.cardElevated,
    variant === 'filled' && styles.cardFilled,
    style,
  ].filter(Boolean) as ViewStyle[]

  return (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  )
}

export default Card
