import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, borderRadius } from '../../styles/tokens'

/**
 * Skeleton Loader Component
 * STORY-004: Mobile UX Polish
 *
 * Animated loading skeleton for lists and content
 */

export interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.md,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  )
}

export interface ListSkeletonProps {
  count?: number
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ count = 5 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <View style={styles.row}>
            <Skeleton width={60} height={60} borderRadius={borderRadius.lg} />
            <View style={styles.content}>
              <Skeleton width="70%" height={18} />
              <Skeleton width="50%" height={14} style={{ marginTop: spacing[2] }} />
              <Skeleton width="40%" height={14} style={{ marginTop: spacing[2] }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral200,
  },
  container: {
    padding: spacing[4],
  },
  listItem: {
    marginBottom: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
})

export default Skeleton
