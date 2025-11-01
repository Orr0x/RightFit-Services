import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { spacing, typography, borderRadius } from '../../styles/tokens'
import { useThemeColors } from '../../hooks/useThemeColors'
import offlineDataService from '../../services/offlineDataService'

/**
 * OfflineIndicator Component
 * STORY-004: Mobile UX Polish
 * STORY-005: Dark Mode Support
 *
 * Shows offline status, sync status, and queued operations
 */

export interface OfflineIndicatorProps {
  onManualSync?: () => void
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.warning,
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    containerOffline: {
      backgroundColor: colors.error,
    },
    containerQueued: {
      backgroundColor: colors.primary,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      minHeight: 40,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success,
    },
    dotOffline: {
      backgroundColor: colors.white,
    },
    statusText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.white,
    },
    syncButton: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: borderRadius.sm,
    },
    syncButtonText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
    },
    lastSyncedText: {
      fontSize: typography.fontSize.xs,
      color: 'rgba(255, 255, 255, 0.8)',
    },
  })

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onManualSync }) => {
  const colors = useThemeColors()
  const styles = createStyles(colors)
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [queuedCount, setQueuedCount] = useState(0)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [slideAnim] = useState(new Animated.Value(-100))

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isOnline || queuedCount > 0) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start()
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isOnline, queuedCount])

  const checkStatus = async () => {
    const online = await offlineDataService.isOnline()
    setIsOnline(online)

    // Get queued operations count
    const operations = await offlineDataService.getQueuedOperationsCount()
    setQueuedCount(operations)
  }

  const handleManualSync = async () => {
    if (isSyncing || !isOnline) return

    setIsSyncing(true)
    try {
      await offlineDataService.syncQueuedData()
      setLastSynced(new Date())
      await checkStatus()
      onManualSync?.()
    } catch (error) {
      console.error('Manual sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusText = () => {
    if (isSyncing) return 'Syncing...'
    if (!isOnline) return 'Offline'
    if (queuedCount > 0) return `${queuedCount} queued`
    return 'Online'
  }

  const getLastSyncedText = () => {
    if (!lastSynced) return ''
    const now = new Date()
    const diff = now.getTime() - lastSynced.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes === 0) return 'Just now'
    if (minutes === 1) return '1 min ago'
    if (minutes < 60) return `${minutes} mins ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <Animated.View
      style={[
        styles.container,
        !isOnline && styles.containerOffline,
        queuedCount > 0 && isOnline && styles.containerQueued,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <View style={[styles.dot, !isOnline && styles.dotOffline]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {isOnline && queuedCount > 0 && !isSyncing && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleManualSync}
            activeOpacity={0.7}
          >
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        )}

        {lastSynced && (
          <Text style={styles.lastSyncedText}>{getLastSyncedText()}</Text>
        )}
      </View>
    </Animated.View>
  )
}

export default OfflineIndicator
