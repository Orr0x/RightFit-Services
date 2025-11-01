import { colors, darkColors } from '../styles/tokens'
import { useTheme } from '../contexts/ThemeContext'

/**
 * Theme Colors Hook
 * STORY-005: Dark Mode & Cross-Platform Consistency
 *
 * Returns correct color palette based on current theme
 */

export const useThemeColors = () => {
  const { theme } = useTheme()
  return theme === 'dark' ? darkColors : colors
}
