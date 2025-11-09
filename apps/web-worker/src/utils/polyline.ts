/**
 * Polyline encoding/decoding utilities
 * Implements Google's Encoded Polyline Algorithm
 * Used by OSRM and Google Maps for compact route representation
 */

import type { Coordinates } from '@rightfit/shared/types/navigation'

/**
 * Decode an encoded polyline string to an array of coordinates
 *
 * @param encoded - Encoded polyline string from OSRM/Google Maps
 * @param precision - Precision of encoding (default: 5 for lat/lon, 6 for OSRM)
 * @returns Array of decoded coordinates
 *
 * @example
 * ```ts
 * const polyline = "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
 * const coords = decodePolyline(polyline)
 * // Returns: [{ latitude: 38.5, longitude: -120.2 }, ...]
 * ```
 */
export function decodePolyline(encoded: string, precision: number = 5): Coordinates[] {
  if (!encoded || encoded.length === 0) {
    return []
  }

  const coordinates: Coordinates[] = []
  let index = 0
  let lat = 0
  let lon = 0
  const factor = Math.pow(10, precision)

  while (index < encoded.length) {
    // Decode latitude
    let result = 0
    let shift = 0
    let byte: number

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1
    lat += deltaLat

    // Decode longitude
    result = 0
    shift = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const deltaLon = result & 1 ? ~(result >> 1) : result >> 1
    lon += deltaLon

    coordinates.push({
      latitude: lat / factor,
      longitude: lon / factor,
    })
  }

  return coordinates
}

/**
 * Encode an array of coordinates to a polyline string
 *
 * @param coordinates - Array of coordinates to encode
 * @param precision - Precision of encoding (default: 5)
 * @returns Encoded polyline string
 *
 * @example
 * ```ts
 * const coords = [{ latitude: 38.5, longitude: -120.2 }]
 * const polyline = encodePolyline(coords)
 * // Returns: "_p~iF~ps|U"
 * ```
 */
export function encodePolyline(coordinates: Coordinates[], precision: number = 5): string {
  if (!coordinates || coordinates.length === 0) {
    return ''
  }

  const factor = Math.pow(10, precision)
  let output = ''
  let prevLat = 0
  let prevLon = 0

  for (const coord of coordinates) {
    const lat = Math.round(coord.latitude * factor)
    const lon = Math.round(coord.longitude * factor)

    output += encodeNumber(lat - prevLat)
    output += encodeNumber(lon - prevLon)

    prevLat = lat
    prevLon = lon
  }

  return output
}

/**
 * Encode a single number for polyline encoding
 */
function encodeNumber(num: number): string {
  let encoded = ''
  let value = num < 0 ? ~(num << 1) : num << 1

  while (value >= 0x20) {
    encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63)
    value >>= 5
  }

  encoded += String.fromCharCode(value + 63)
  return encoded
}
