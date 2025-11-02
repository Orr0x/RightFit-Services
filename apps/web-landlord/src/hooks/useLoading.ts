/**
 * Loading State Hook
 * US-UX-5: Implement Loading States
 */

import { useState, useCallback } from 'react'

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)
  const [error, setError] = useState<Error | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setError(null)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const setLoadingError = useCallback((err: Error) => {
    setError(err)
    setIsLoading(false)
  }, [])

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        startLoading()
        const result = await fn()
        stopLoading()
        return result
      } catch (err) {
        setLoadingError(err as Error)
        return null
      }
    },
    [startLoading, stopLoading, setLoadingError]
  )

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    withLoading,
  }
}
