import { TransitionPresets, StackNavigationOptions } from '@react-navigation/stack'
import { useThemeColors } from '../hooks/useThemeColors'

/**
 * Screen Transition Options
 * STORY-004: Mobile UX Polish
 * STORY-005: Dark Mode Support
 *
 * Smooth 60fps screen transitions with slide animation
 * Now supports dynamic theming
 */

export const getDefaultScreenOptions = (colors: ReturnType<typeof useThemeColors>): StackNavigationOptions => ({
  ...TransitionPresets.SlideFromRightIOS,
  headerStyle: {
    backgroundColor: colors.surface,
    elevation: 1,
    shadowOpacity: 0.1,
  },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: {
    fontWeight: '600',
  },
  cardStyle: {
    backgroundColor: colors.background,
  },
  // Enable gesture-based navigation
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  // Optimize for 60fps
  animationEnabled: true,
  presentation: 'card',
})

export const getModalScreenOptions = (colors: ReturnType<typeof useThemeColors>): StackNavigationOptions => ({
  ...TransitionPresets.ModalSlideFromBottomIOS,
  headerStyle: {
    backgroundColor: colors.surface,
    elevation: 1,
    shadowOpacity: 0.1,
  },
  headerTintColor: colors.textPrimary,
  cardStyle: {
    backgroundColor: colors.background,
  },
  gestureEnabled: true,
  gestureDirection: 'vertical',
  animationEnabled: true,
  presentation: 'modal',
})
