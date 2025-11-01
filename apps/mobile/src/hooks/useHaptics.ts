import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

/**
 * Haptics Hook
 * STORY-004: Mobile UX Polish
 *
 * Provides haptic feedback utilities for iOS and Android
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

export const useHaptics = () => {
  const trigger = async (type: HapticType = 'light') => {
    // Haptics only work on physical devices, not emulators
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return
    }

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          break
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          break
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
          break
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          break
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          break
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
          break
      }
    } catch (error) {
      // Silently fail if haptics not supported
      console.warn('Haptic feedback not available:', error)
    }
  }

  return {
    trigger,
    light: () => trigger('light'),
    medium: () => trigger('medium'),
    heavy: () => trigger('heavy'),
    success: () => trigger('success'),
    warning: () => trigger('warning'),
    error: () => trigger('error'),
  }
}
