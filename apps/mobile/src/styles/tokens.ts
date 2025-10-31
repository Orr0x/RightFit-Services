/**
 * Design Tokens - React Native
 * STORY-002: Mobile Component Library
 * Ported from web variables.css for cross-platform consistency
 */

export const colors = {
  // Primary Brand Colors
  primary: '#0ea5e9',
  primary50: '#f0f9ff',
  primary100: '#e0f2fe',
  primary500: '#0ea5e9',
  primary600: '#0284c7',
  primary700: '#0369a1',

  // Semantic Colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutrals
  white: '#ffffff',
  black: '#000000',
  neutral50: '#fafafa',
  neutral100: '#f5f5f5',
  neutral200: '#e5e5e5',
  neutral300: '#d4d4d4',
  neutral400: '#a3a3a3',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral800: '#262626',
  neutral900: '#171717',
  neutral950: '#0a0a0a',

  // Semantic - Light Mode (default)
  background: '#ffffff',
  surface: '#ffffff',
  surfaceElevated: '#fafafa',
  border: '#e5e5e5',
  borderHover: '#d4d4d4',
  textPrimary: '#171717',
  textSecondary: '#525252',
  textTertiary: '#737373',
  textInverse: '#ffffff',
  hover: '#f5f5f5',
  focus: '#0ea5e9',
}

export const spacing = {
  // Numeric spacing (for Button component)
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  20: 80,
  // Named spacing aliases (for migrated screens)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
}

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeight: {
    normal: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },
  lineHeight: {
    normal: 1.5,
    tight: 1.25,
    relaxed: 1.75,
  },
  // Aliases for migrated screens
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    normal: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },
}

export const borderRadius = {
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
}

export const zIndex = {
  dropdown: 1000,
  sticky: 1100,
  modal: 1400,
  toast: 1500,
}

// Dark mode colors
export const darkColors = {
  ...colors,
  background: '#0a0a0a',
  surface: '#171717',
  surfaceElevated: '#262626',
  border: '#404040',
  borderHover: '#525252',
  textPrimary: '#fafafa',
  textSecondary: '#d4d4d4',
  textTertiary: '#a3a3a3',
}

export const tokens = {
  colors,
  darkColors,
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
}

export default tokens
