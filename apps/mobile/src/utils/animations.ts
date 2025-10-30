/**
 * Animation Utilities
 * US-UX-11: Animations & Transitions (8 pts)
 *
 * 60fps animation utilities for React Native
 */

import { Animated, Easing } from 'react-native'

export const ANIMATION_DURATION = {
  fast: 150,
  base: 200,
  slow: 300,
  slower: 400,
}

export const EASING = {
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  spring: Easing.elastic(1),
  bounce: Easing.bounce,
}

/**
 * Fade animation
 */
export const createFadeAnimation = (
  value: Animated.Value,
  toValue: number,
  duration = ANIMATION_DURATION.base
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: EASING.easeInOut,
    useNativeDriver: true,
  })
}

/**
 * Slide animation
 */
export const createSlideAnimation = (
  value: Animated.Value,
  toValue: number,
  duration = ANIMATION_DURATION.base
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: EASING.easeOut,
    useNativeDriver: true,
  })
}

/**
 * Scale animation (for press feedback)
 */
export const createScaleAnimation = (
  value: Animated.Value,
  toValue: number,
  duration = ANIMATION_DURATION.fast
) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: EASING.easeInOut,
    useNativeDriver: true,
  })
}

/**
 * Spring animation (for bouncy effects)
 */
export const createSpringAnimation = (
  value: Animated.Value,
  toValue: number,
  tension = 40,
  friction = 7
) => {
  return Animated.spring(value, {
    toValue,
    tension,
    friction,
    useNativeDriver: true,
  })
}

/**
 * Sequence multiple animations
 */
export const sequence = (...animations: Animated.CompositeAnimation[]) => {
  return Animated.sequence(animations)
}

/**
 * Run animations in parallel
 */
export const parallel = (...animations: Animated.CompositeAnimation[]) => {
  return Animated.parallel(animations)
}

/**
 * Press animation (scale down and back)
 */
export const createPressAnimation = (scaleValue: Animated.Value) => {
  return sequence(
    createScaleAnimation(scaleValue, 0.95, 100),
    createScaleAnimation(scaleValue, 1, 100)
  )
}

/**
 * Pull to refresh animation
 */
export const createPullToRefreshAnimation = (
  translateY: Animated.Value,
  onRefresh: () => void
) => {
  return sequence(
    createSlideAnimation(translateY, 60, 200),
    Animated.timing(translateY, {
      toValue: 40,
      duration: 100,
      useNativeDriver: true,
    }),
  ).start(() => {
    onRefresh()
    createSlideAnimation(translateY, 0, 300).start()
  })
}

/**
 * Card expand animation
 */
export const createCardExpandAnimation = (
  heightValue: Animated.Value,
  toHeight: number
) => {
  return Animated.timing(heightValue, {
    toValue: toHeight,
    duration: ANIMATION_DURATION.base,
    easing: EASING.easeInOut,
    useNativeDriver: false, // Height animations can't use native driver
  })
}

/**
 * Stagger children animations
 */
export const createStaggerAnimation = (
  items: Animated.Value[],
  delay = 50,
  animation: (value: Animated.Value) => Animated.CompositeAnimation
) => {
  return Animated.stagger(
    delay,
    items.map((item) => animation(item))
  )
}
