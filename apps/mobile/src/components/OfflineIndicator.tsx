import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Banner, Text } from 'react-native-paper'
import { useNetwork } from '../contexts/NetworkContext'

export default function OfflineIndicator() {
  const { isOnline, isChecking } = useNetwork()

  if (isChecking || isOnline) {
    return null
  }

  return (
    <View style={styles.container}>
      <Banner
        visible={!isOnline}
        icon="wifi-off"
        style={styles.banner}
      >
        <Text style={styles.text}>
          You're offline. Changes will be synced when you're back online.
        </Text>
      </Banner>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  banner: {
    backgroundColor: '#FF9800',
  },
  text: {
    color: '#fff',
    fontWeight: '500',
  },
})
