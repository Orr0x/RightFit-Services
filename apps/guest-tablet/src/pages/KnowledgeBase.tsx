import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Card,
  CardContent,
  Grid,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Wifi as WifiIcon,
  LocalParking as ParkingIcon,
  FitnessCenter as FitnessIcon,
  Pool as PoolIcon,
  Pets as PetsIcon,
  LocalLaundryService as LaundryIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface KnowledgeItem {
  id: string
  category: string
  title: string
  content: string
  tags: string[]
}

interface PropertyInfo {
  name: string
  address: string
  check_in_time: string
  check_out_time: string
  wifi_name: string
  wifi_password: string
  emergency_contact: string
  manager_email: string
}

const PLACEHOLDER_PROPERTY: PropertyInfo = {
  name: 'Highland Haven',
  address: '123 Highland Drive, Edinburgh, EH1 2AB',
  check_in_time: '3:00 PM',
  check_out_time: '11:00 AM',
  wifi_name: 'HighlandHaven-Guest',
  wifi_password: 'Welcome2024!',
  emergency_contact: '+44 7700 900123',
  manager_email: 'manager@highlandhaven.co.uk',
}

const PLACEHOLDER_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: '1',
    category: 'WiFi & Internet',
    title: 'How to connect to WiFi',
    content: `Network Name: HighlandHaven-Guest\nPassword: Welcome2024!\n\nSimply select the network from your device's WiFi settings and enter the password. If you experience any connection issues, try restarting your device or contact the property manager.`,
    tags: ['wifi', 'internet', 'connection'],
  },
  {
    id: '2',
    category: 'Parking',
    title: 'Parking Information',
    content: `Free parking is available in the designated guest parking area behind the building. Please display your unit number on your dashboard.\n\nGuest parking spots are marked with green paint. Street parking is also available but check posted signs for restrictions.`,
    tags: ['parking', 'car', 'vehicle'],
  },
  {
    id: '3',
    category: 'Amenities',
    title: 'Fitness Center Access',
    content: `The fitness center is located on the ground floor and is open 24/7 for guests. Access code: 4321\n\nFacilities include:\n• Treadmills and elliptical machines\n• Free weights and resistance equipment\n• Yoga mats and exercise balls\n\nPlease bring your own towel and wipe down equipment after use.`,
    tags: ['fitness', 'gym', 'exercise', 'amenities'],
  },
  {
    id: '4',
    category: 'Amenities',
    title: 'Swimming Pool Rules',
    content: `Pool hours: 7:00 AM - 10:00 PM daily\n\nRules:\n• No glass containers in pool area\n• Children must be supervised by an adult\n• Shower before entering pool\n• No diving in shallow end\n• Maximum capacity: 15 people\n\nPool towels are available in the storage closet.`,
    tags: ['pool', 'swimming', 'amenities'],
  },
  {
    id: '5',
    category: 'Policies',
    title: 'Pet Policy',
    content: `Pets are welcome with prior approval!\n\nRequirements:\n• Maximum 2 pets per unit\n• Weight limit: 50 lbs per pet\n• Additional deposit required\n• Pets must be leashed in common areas\n• Please clean up after your pet\n\nDesignated pet relief area is located near the north entrance.`,
    tags: ['pets', 'dogs', 'cats', 'animals', 'policy'],
  },
  {
    id: '6',
    category: 'Facilities',
    title: 'Laundry Facilities',
    content: `Coin-operated laundry room is located on the ground floor.\n\nHours: 6:00 AM - 11:00 PM\n\nCost:\n• Washers: £2.50 per load\n• Dryers: £2.00 per cycle\n\nChange machine available. Detergent vending machine on site.\n\nPlease remove laundry promptly after cycle completes.`,
    tags: ['laundry', 'washing', 'facilities'],
  },
  {
    id: '7',
    category: 'Check-in/Check-out',
    title: 'Check-in & Check-out Times',
    content: `Check-in: 3:00 PM\nCheck-out: 11:00 AM\n\nEarly check-in or late check-out may be available upon request (subject to availability and additional fees).\n\nFor self check-in instructions, refer to the welcome email sent before your arrival.`,
    tags: ['check-in', 'check-out', 'arrival', 'departure'],
  },
  {
    id: '8',
    category: 'Local Info',
    title: 'Nearby Restaurants & Attractions',
    content: `Top nearby restaurants:\n• The Highland Grill (0.3 mi) - Scottish cuisine\n• Pasta Paradise (0.5 mi) - Italian\n• Sushi Express (0.4 mi) - Japanese\n\nNearby attractions:\n• Edinburgh Castle (2 mi)\n• Royal Mile (1.8 mi)\n• Arthur's Seat (3 mi)\n• National Museum of Scotland (1.5 mi)\n\nPublic transport: Bus stop directly outside, trains at Waverley Station (1.2 mi)`,
    tags: ['restaurants', 'food', 'attractions', 'local', 'transport'],
  },
]

export default function KnowledgeBase() {
  const navigate = useNavigate()
  const [propertyInfo] = useState<PropertyInfo>(PLACEHOLDER_PROPERTY)
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKnowledgeBase()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(knowledgeItems)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = knowledgeItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, knowledgeItems])

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true)
      const propertyId = sessionStorage.getItem('guest_property_id') || 'demo-property'
      const response = await fetch(`/api/guest/knowledge-base?property_id=${propertyId}`)

      if (response.ok) {
        const data = await response.json()
        setKnowledgeItems(data.data || PLACEHOLDER_KNOWLEDGE)
      } else {
        setKnowledgeItems(PLACEHOLDER_KNOWLEDGE)
      }
    } catch (error) {
      console.error('Failed to load knowledge base:', error)
      setKnowledgeItems(PLACEHOLDER_KNOWLEDGE)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase()
    if (cat.includes('wifi') || cat.includes('internet')) return <WifiIcon />
    if (cat.includes('parking')) return <ParkingIcon />
    if (cat.includes('fitness') || cat.includes('gym')) return <FitnessIcon />
    if (cat.includes('pool') || cat.includes('amenities')) return <PoolIcon />
    if (cat.includes('pet')) return <PetsIcon />
    if (cat.includes('laundry')) return <LaundryIcon />
    return <InfoIcon />
  }

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, KnowledgeItem[]>)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          color: 'white',
        }}
      >
        <IconButton
          onClick={() => navigate('/')}
          sx={{ color: 'white', mr: 2 }}
          size="large"
        >
          <BackIcon fontSize="large" />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Property Information
        </Typography>
      </Box>

      {/* Content Container */}
      <Paper
        sx={{
          flex: 1,
          borderRadius: 3,
          overflow: 'auto',
          maxWidth: 1000,
          width: '100%',
          mx: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Property Info Card */}
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <HomeIcon sx={{ fontSize: 32, color: '#667eea', mr: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {propertyInfo.name}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Address
                  </Typography>
                  <Typography variant="body2">{propertyInfo.address}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Check-in / Check-out
                  </Typography>
                  <Typography variant="body2">
                    {propertyInfo.check_in_time} / {propertyInfo.check_out_time}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <WifiIcon sx={{ mr: 1, color: '#667eea' }} />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      WiFi
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {propertyInfo.wifi_name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {propertyInfo.wifi_password}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 18, color: '#667eea' }} />
                    <Typography variant="body2">{propertyInfo.emergency_contact}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <EmailIcon sx={{ mr: 1, fontSize: 18, color: '#667eea' }} />
                    <Typography variant="body2">{propertyInfo.manager_email}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Search and Knowledge Items */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Frequently Asked Questions
          </Typography>

          <TextField
            fullWidth
            placeholder="Search for information..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Loading information...</Typography>
            </Box>
          ) : filteredItems.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                No results found for "{searchQuery}"
              </Typography>
            </Box>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}
                >
                  {getCategoryIcon(category)}
                  <Box component="span" sx={{ ml: 1 }}>
                    {category}
                  </Box>
                </Typography>
                {items.map((item) => (
                  <Accordion key={item.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{item.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-line', mb: 2 }}
                      >
                        {item.content}
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {item.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  )
}
