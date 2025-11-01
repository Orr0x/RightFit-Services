import { TransitionPresets, StackNavigationOptions } from '@react-navigation/stack'
import { colors } from '../styles/tokens'

/**
 * Screen Transition Options
 * STORY-004: Mobile UX Polish
 *
 * Smooth 60fps screen transitions with slide animation
 */

export const defaultScreenOptions: StackNavigationOptions = {
  ...TransitionPresets.SlideFromRightIOS,
  headerStyle: {
    backgroundColor: colors.white,
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
}

export const modalScreenOptions: StackNavigationOptions = {
  ...TransitionPresets.ModalSlideFromBottomIOS,
  headerStyle: {
    backgroundColor: colors.white,
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
}
