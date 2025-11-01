import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native'
import { colors, spacing, typography, borderRadius } from '../../styles/tokens'
import { useHaptics } from '../../hooks/useHaptics'

/**
 * Button Component - React Native
 * STORY-002: Mobile Component Library
 * STORY-004: Added haptic feedback
 * Cross-platform parity with web Button component
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
  testID?: string
  /** Enable haptic feedback on press (default: true) */
  haptics?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onPress,
  style,
  testID,
  haptics = true,
}) => {
  const { light } = useHaptics()

  const buttonStyles: ViewStyle[] = [
    styles.button,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] as ViewStyle,
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as ViewStyle,
    fullWidth && styles.buttonFullWidth,
    (disabled || loading) && styles.buttonDisabled,
    style,
  ].filter(Boolean) as ViewStyle[]

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles] as TextStyle,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles] as TextStyle,
    (disabled || loading) && styles.textDisabled,
  ].filter(Boolean) as TextStyle[]

  const handlePress = () => {
    if (haptics) {
      light()
    }
    onPress?.()
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={textStyles}>{children}</Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Variants
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.neutral100,
    borderColor: colors.border,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },

  // Sizes
  buttonSm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minHeight: 36,
  },
  buttonMd: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 44,
  },
  buttonLg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    minHeight: 52,
  },

  // States
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Text
  text: {
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },
  textPrimary: {
    color: colors.white,
  },
  textSecondary: {
    color: colors.textPrimary,
  },
  textGhost: {
    color: colors.primary,
  },
  textDanger: {
    color: colors.white,
  },
  textSm: {
    fontSize: typography.fontSize.sm,
  },
  textMd: {
    fontSize: typography.fontSize.base,
  },
  textLg: {
    fontSize: typography.fontSize.lg,
  },
  textDisabled: {
    opacity: 1,
  },

  // Content layout
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: spacing[2],
  },
  rightIcon: {
    marginLeft: spacing[2],
  },
})

export default Button
