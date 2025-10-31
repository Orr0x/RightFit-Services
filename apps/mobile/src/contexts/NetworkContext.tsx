import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import NetInfo from '@react-native-community/netinfo'

interface NetworkContextValue {
  isOnline: boolean
  isChecking: boolean
}

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  isChecking: true,
})

export function useNetwork() {
  return useContext(NetworkContext)
}

interface NetworkProviderProps {
  children: ReactNode
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null

    // Subscribe to network state updates with debouncing
    const unsubscribe = NetInfo.addEventListener(state => {
      // Clear any pending updates
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      // Debounce network state changes to prevent rapid-fire events
      debounceTimer = setTimeout(() => {
        const online = state.isConnected && state.isInternetReachable !== false
        setIsOnline(online)
        setIsChecking(false)
      }, 300) // Wait 300ms for events to settle
    })

    // Initial check (no debounce needed)
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false)
      setIsChecking(false)
    })

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      unsubscribe()
    }
  }, [])

  return (
    <NetworkContext.Provider value={{ isOnline, isChecking }}>
      {children}
    </NetworkContext.Provider>
  )
}
