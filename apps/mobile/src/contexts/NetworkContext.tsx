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
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false)
      setIsChecking(false)
    })

    // Initial check
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false)
      setIsChecking(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <NetworkContext.Provider value={{ isOnline, isChecking }}>
      {children}
    </NetworkContext.Provider>
  )
}
