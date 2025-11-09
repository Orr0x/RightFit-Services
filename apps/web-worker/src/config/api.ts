// API configuration for the worker app

// Get the API base URL from environment or default to localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

/**
 * Constructs a full URL from a path that might be relative or absolute
 * @param path - The path to convert (e.g., "/uploads/photo.jpg" or "http://example.com/photo.jpg")
 * @returns Full URL to the resource
 */
export function getFullUrl(path: string | null | undefined): string {
  if (!path) return ''

  // If the path is already a full URL (starts with http:// or https://), return it as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // If the path is relative, prepend the API base URL
  // Remove leading slash from path if API_BASE_URL already has one at the end
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${cleanPath}`
}

/**
 * Constructs a full photo URL from a path
 * @param photoPath - The photo path (relative or absolute)
 * @returns Full URL to the photo
 */
export function getPhotoUrl(photoPath: string | null | undefined): string {
  return getFullUrl(photoPath)
}
