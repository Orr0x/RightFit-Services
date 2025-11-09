import axios from 'axios'

/**
 * Traffic incident from TomTom API
 */
interface TrafficIncident {
  type: string
  geometry: {
    type: string
    coordinates: number[][]
  }
  properties: {
    id: string
    iconCategory: number
    magnitudeOfDelay: number
    events: Array<{
      description: string
      code: number
      iconCategory: number
    }>
    startTime: string
    endTime: string
    from: string
    to: string
    length: number
    delay: number
    roadNumbers: string[]
    aci: {
      probabilityOfOccurrence: string
      numberOfReports: number
      lastReportTime: string
    }
  }
}

/**
 * Traffic flow segment from TomTom API
 */
interface TrafficFlowSegment {
  frc: string // Functional Road Class
  currentSpeed: number
  freeFlowSpeed: number
  currentTravelTime: number
  freeFlowTravelTime: number
  confidence: number
  roadClosure: boolean
  coordinates: {
    coordinate: Array<{
      latitude: number
      longitude: number
    }>
  }
}

/**
 * Processed traffic incident for frontend
 */
export interface ProcessedTrafficIncident {
  id: string
  type: string
  description: string
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'
  location: {
    latitude: number
    longitude: number
  }
  delay_minutes: number
  start_time: string
  end_time: string
  affected_roads: string[]
  from: string
  to: string
}

/**
 * Traffic flow data for a route segment
 */
export interface TrafficFlowData {
  current_speed_kmh: number
  free_flow_speed_kmh: number
  congestion_level: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'
  delay_minutes: number
  road_closed: boolean
}

/**
 * Complete traffic data response
 */
export interface TrafficData {
  incidents: ProcessedTrafficIncident[]
  flow: {
    overall_congestion: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'
    average_speed_kmh: number
    average_delay_minutes: number
    total_incidents: number
  }
  last_updated: Date
}

/**
 * TrafficService - TomTom Traffic API integration
 *
 * Provides real-time traffic incident and flow data for navigation
 *
 * API Documentation: https://developer.tomtom.com/traffic-api/documentation
 * Free tier: 2,500 requests/day
 */
export class TrafficService {
  private apiKey: string
  private baseUrl = 'https://api.tomtom.com/traffic'

  constructor() {
    this.apiKey = process.env.TOMTOM_API_KEY || ''

    if (!this.apiKey) {
      console.warn('⚠️  TOMTOM_API_KEY not configured - traffic data will not be available')
    }
  }

  /**
   * Check if TomTom API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Get traffic incidents along a route
   *
   * @param coordinates Array of [lat, lon] coordinates forming the route
   * @returns Array of processed traffic incidents
   */
  async getTrafficIncidents(
    coordinates: Array<{ latitude: number; longitude: number }>
  ): Promise<ProcessedTrafficIncident[]> {
    if (!this.isConfigured()) {
      return []
    }

    try {
      // Calculate bounding box from coordinates
      const lats = coordinates.map(c => c.latitude)
      const lons = coordinates.map(c => c.longitude)

      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLon = Math.min(...lons)
      const maxLon = Math.max(...lons)

      // Add padding to bounding box (0.01 degrees ~= 1km)
      const padding = 0.01
      const bbox = `${minLon - padding},${minLat - padding},${maxLon + padding},${maxLat + padding}`

      // TomTom Traffic Incidents API v5
      const url = `${this.baseUrl}/services/5/incidentDetails`

      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          bbox,
          fields: '{incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events,startTime,endTime,from,to,length,delay,roadNumbers}}}',
          language: 'en-GB',
          categoryFilter: '0,1,2,3,4,5,6,7,8,9,10,11,14', // All incident categories
          timeValidityFilter: 'present',
        },
        timeout: 5000,
      })

      if (!response.data?.incidents) {
        return []
      }

      // Process incidents
      const incidents: ProcessedTrafficIncident[] = response.data.incidents.map(
        (incident: TrafficIncident) => {
          // Get center point of incident
          const coords = incident.geometry.coordinates[0]
          const centerLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length
          const centerLon = coords.reduce((sum, c) => sum + c[0], 0) / coords.length

          // Determine severity based on magnitude of delay
          let severity: ProcessedTrafficIncident['severity'] = 'LOW'
          if (incident.properties.magnitudeOfDelay >= 4) severity = 'SEVERE'
          else if (incident.properties.magnitudeOfDelay === 3) severity = 'HIGH'
          else if (incident.properties.magnitudeOfDelay === 2) severity = 'MODERATE'

          // Get primary event description
          const primaryEvent = incident.properties.events[0]
          const description = primaryEvent?.description || 'Traffic incident'

          return {
            id: incident.properties.id,
            type: incident.type,
            description,
            severity,
            location: {
              latitude: centerLat,
              longitude: centerLon,
            },
            delay_minutes: Math.round(incident.properties.delay / 60),
            start_time: incident.properties.startTime,
            end_time: incident.properties.endTime,
            affected_roads: incident.properties.roadNumbers || [],
            from: incident.properties.from || '',
            to: incident.properties.to || '',
          }
        }
      )

      return incidents
    } catch (error) {
      console.error('Error fetching traffic incidents:', error)
      return []
    }
  }

  /**
   * Get traffic flow data for a route
   *
   * @param coordinates Array of [lat, lon] coordinates forming the route
   * @returns Traffic flow data with congestion levels
   */
  async getTrafficFlow(
    coordinates: Array<{ latitude: number; longitude: number }>
  ): Promise<TrafficFlowData | null> {
    if (!this.isConfigured()) {
      return null
    }

    try {
      // Sample middle point of route for flow data
      const midIndex = Math.floor(coordinates.length / 2)
      const point = coordinates[midIndex]

      // TomTom Traffic Flow Segment Data API v4
      const url = `${this.baseUrl}/services/4/flowSegmentData/absolute/10/json`

      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          point: `${point.latitude},${point.longitude}`,
          unit: 'KMPH',
        },
        timeout: 5000,
      })

      if (!response.data?.flowSegmentData) {
        return null
      }

      const data: TrafficFlowSegment = response.data.flowSegmentData

      // Calculate congestion level
      const speedRatio = data.currentSpeed / data.freeFlowSpeed
      let congestionLevel: TrafficFlowData['congestion_level'] = 'NONE'

      if (data.roadClosure) {
        congestionLevel = 'SEVERE'
      } else if (speedRatio < 0.25) {
        congestionLevel = 'SEVERE'
      } else if (speedRatio < 0.5) {
        congestionLevel = 'HIGH'
      } else if (speedRatio < 0.75) {
        congestionLevel = 'MODERATE'
      } else if (speedRatio < 0.9) {
        congestionLevel = 'LOW'
      }

      const delayMinutes = Math.round((data.currentTravelTime - data.freeFlowTravelTime) / 60)

      return {
        current_speed_kmh: data.currentSpeed,
        free_flow_speed_kmh: data.freeFlowSpeed,
        congestion_level: congestionLevel,
        delay_minutes: Math.max(0, delayMinutes),
        road_closed: data.roadClosure,
      }
    } catch (error) {
      console.error('Error fetching traffic flow:', error)
      return null
    }
  }

  /**
   * Get complete traffic data for a route
   *
   * @param coordinates Array of route coordinates
   * @returns Complete traffic data including incidents and flow
   */
  async getRouteTrafficData(
    coordinates: Array<{ latitude: number; longitude: number }>
  ): Promise<TrafficData> {
    const [incidents, flow] = await Promise.all([
      this.getTrafficIncidents(coordinates),
      this.getTrafficFlow(coordinates),
    ])

    // Calculate overall statistics
    const totalIncidents = incidents.length
    const severeIncidents = incidents.filter(i => i.severity === 'SEVERE' || i.severity === 'HIGH').length

    let overallCongestion: TrafficData['flow']['overall_congestion'] = flow?.congestion_level || 'NONE'

    // Upgrade congestion level if there are severe incidents
    if (severeIncidents > 0) {
      overallCongestion = 'SEVERE'
    } else if (totalIncidents > 3) {
      overallCongestion = 'HIGH'
    }

    const averageDelay = incidents.length > 0
      ? Math.round(incidents.reduce((sum, i) => sum + i.delay_minutes, 0) / incidents.length)
      : flow?.delay_minutes || 0

    return {
      incidents,
      flow: {
        overall_congestion: overallCongestion,
        average_speed_kmh: flow?.current_speed_kmh || 0,
        average_delay_minutes: averageDelay,
        total_incidents: totalIncidents,
      },
      last_updated: new Date(),
    }
  }
}

export const trafficService = new TrafficService()
