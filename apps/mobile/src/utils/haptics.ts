/**
 * Haptic Feedback Utilities
 * US-UX-12: Haptic Feedback Implementation (3 pts)
 *
 * Tactile feedback for user interactions
 */

import * as Haptics from 'expo-haptics'

/**
 * Light haptic for button taps
 */
export const lightHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

/**
 * Medium haptic for selections
 */
export const mediumHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

/**
 * Heavy haptic for important actions
 */
export const heavyHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
}

/**
 * Success haptic
 */
export const successHaptic = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}

/**
 * Warning haptic
 */
export const warningHaptic = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
}

/**
 * Error haptic
 */
export const errorHaptic = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
}

/**
 * Selection haptic (for swipe actions, toggles)
 */
export const selectionHaptic = () => {
  Haptics.selectionAsync()
}

/**
 * Haptic for button press
 */
export const buttonPressHaptic = () => {
  lightHaptic()
}

/**
 * Haptic for swipe action
 */
export const swipeActionHaptic = () => {
  selectionHaptic()
}

/**
 * Haptic for form submission
 */
export const formSubmitHaptic = () => {
  mediumHaptic()
}

/**
 * Haptic for delete action
 */
export const deleteHaptic = () => {
  warningHaptic()
}

/**
 * Haptic for sync complete
 */
export const syncCompleteHaptic = () => {
  successHaptic()
}
