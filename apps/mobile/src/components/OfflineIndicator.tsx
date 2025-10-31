import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useNetwork } from '../contexts/NetworkContext'

export default function OfflineIndicator() {
  const { isOnline, isChecking } = useNetwork()

  if (isChecking || isOnline) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.text}>
          ⚠️ You're offline. Changes will be synced when you're back online.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  banner: {
    backgroundColor: '#FF9800',
    padding: 16,
  },
  text: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
})
