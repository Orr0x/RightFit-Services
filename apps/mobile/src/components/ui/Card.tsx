import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, borderRadius, shadows } from '../../styles/tokens'

/**
 * Card Component - React Native
 * STORY-002: Mobile Component Library
 */

export type CardVariant = 'outlined' | 'elevated' | 'filled'

export interface CardProps {
  children: React.ReactNode
  variant?: CardVariant
  padding?: keyof typeof spacing
  style?: ViewStyle
  testID?: string
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'outlined',
  padding = 4,
  style,
  testID,
}) => {
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

const styles = StyleSheet.create({
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

export default Card
