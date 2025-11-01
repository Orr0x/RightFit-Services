import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TextStyle, ViewStyle, TextInputProps } from 'react-native'
import { spacing, typography, borderRadius } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'

/**
 * Input Component - React Native
 * STORY-002: Mobile Component Library
 * STORY-005: Dark Mode Support
 */

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing[4],
    },
    containerFullWidth: {
      width: '100%',
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
      marginBottom: spacing[2],
    },
    required: {
      color: colors.error,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      minHeight: 44,
    },
    inputContainerFocused: {
      borderColor: colors.focus,
      borderWidth: 2,
    },
    inputContainerError: {
      borderColor: colors.error,
    },
    input: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: colors.textPrimary,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[3],
    },
    leftIcon: {
      marginLeft: spacing[3],
    },
    rightIcon: {
      marginRight: spacing[3],
    },
    errorText: {
      fontSize: typography.fontSize.sm,
      color: colors.error,
      marginTop: spacing[1],
    },
    helperText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing[1],
    },
  })

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  fullWidth = true,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = (e: any) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: any) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  return (
    <View style={[styles.container, fullWidth && styles.containerFullWidth, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          color={colors.textPrimary}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  )
}

export default Input
