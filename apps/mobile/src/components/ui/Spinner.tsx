import React from 'react'
import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing } from '../../styles/tokens'

/**
 * Spinner Component - React Native
 * STORY-002: Mobile Component Library
 */

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  size?: SpinnerSize
  color?: string
  centered?: boolean
  style?: ViewStyle
}

const sizeMap = {
  sm: 'small' as const,
  md: 'large' as const,
  lg: 'large' as const,
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = colors.primary,
  centered = false,
  style,
}) => {
  const spinnerSize = sizeMap[size]

  if (centered) {
    return (
      <View style={[styles.centered, style]}>
        <ActivityIndicator size={spinnerSize} color={color} />
      </View>
    )
  }

  return <ActivityIndicator size={spinnerSize} color={color} style={style} />
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
})

export default Spinner
