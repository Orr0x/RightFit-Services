import React, { createContext, useContext, useState, useEffect } from 'react'
import { Appearance, ColorSchemeName } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Theme Context - Dark Mode Support (Mobile)
 * STORY-005: Dark Mode & Cross-Platform Consistency
 *
 * Port of web ThemeContext to React Native
 */

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: 'light' | 'dark'
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = '@rightfit/themeMode'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    const colorScheme = Appearance.getColorScheme()
    return colorScheme === 'dark' ? 'dark' : 'light'
  })

  // Load saved theme mode on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY)
        if (stored) {
          setThemeModeState(stored as ThemeMode)
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error)
      }
    }
    loadThemeMode()
  }, [])

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light')
    })

    return () => subscription.remove()
  }, [])

  // Calculate effective theme
  const theme = themeMode === 'system' ? systemTheme : themeMode

  // Persist theme mode
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode)
      setThemeModeState(mode)
    } catch (error) {
      console.error('Failed to save theme mode:', error)
      setThemeModeState(mode)
    }
  }

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light'
    setThemeMode(newMode)
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
