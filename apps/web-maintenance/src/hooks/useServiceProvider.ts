import { useAuth } from '../contexts/AuthContext'

/**
 * Hook to get the current user's service provider ID
 * Returns null if user is not authenticated or has no service provider
 */
export function useServiceProvider(): string | null {
  const { user } = useAuth()
  return user?.service_provider_id || null
}

/**
 * Hook to get the service provider ID, throwing an error if not available
 * Use this when the service provider ID is required for the component to function
 */
export function useRequiredServiceProvider(): string {
  const serviceProviderId = useServiceProvider()

  if (!serviceProviderId) {
    throw new Error('Service provider ID is required but not available. User may not be logged in or may not have a service provider.')
  }

  return serviceProviderId
}
