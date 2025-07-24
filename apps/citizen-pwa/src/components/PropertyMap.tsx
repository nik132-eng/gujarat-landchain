"use client";

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Property {
  id: string
  title: string
  location: string
  coordinates: [number, number]
  area: string
  status: 'verified' | 'pending' | 'disputed'
  price?: string
  type: 'residential' | 'commercial' | 'agricultural'
  ulpin?: string
  nftMint?: string
  owner?: string
  lastVerified?: string
  satelliteImage?: string
}

interface PropertyMapProps {
  properties?: Property[]
  onPropertySelect?: (property: Property) => void
  center?: [number, number]
  zoom?: number
  height?: string
  showSatellite?: boolean
  enableSearch?: boolean
}

const gujaratProperties: Property[] = [
  {
    id: '1',
    title: 'Residential Plot - Sector 15',
    location: 'Gandhinagar, Gujarat',
    coordinates: [23.2156, 72.6369],
    area: '2,400',
    status: 'verified',
    price: '₹85,00,000',
    type: 'residential',
    ulpin: 'GJ-01-001-2024-001',
    nftMint: 'ULPinTreasury111111111111111111111111111111',
    owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    lastVerified: '2024-12-15',
    satelliteImage: 'https://ipfs.io/ipfs/QmSatelliteImage1'
  },
  {
    id: '2',
    title: 'Commercial Building',
    location: 'Ahmedabad, Gujarat',
    coordinates: [23.0225, 72.5714],
    area: '8,500',
    status: 'pending',
    price: '₹3,20,00,000',
    type: 'commercial',
    ulpin: 'GJ-01-002-2024-002',
    owner: '0x8ba1f109551bD432803012645Hac136c772c3e3',
    lastVerified: '2024-12-10'
  },
  {
    id: '3',
    title: 'Agricultural Land',
    location: 'Vadodara, Gujarat',
    coordinates: [22.3072, 73.1812],
    area: '12,000',
    status: 'verified',
    price: '₹48,00,000',
    type: 'agricultural',
    ulpin: 'GJ-01-003-2024-003',
    nftMint: 'ULPinTreasury111111111111111111111111111112',
    owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
    lastVerified: '2024-12-12',
    satelliteImage: 'https://ipfs.io/ipfs/QmSatelliteImage2'
  },
  {
    id: '4',
    title: 'IT Park Plot',
    location: 'GIFT City, Gandhinagar',
    coordinates: [23.1685, 72.6503],
    area: '5,200',
    status: 'verified',
    price: '₹2,15,00,000',
    type: 'commercial',
    ulpin: 'GJ-01-004-2024-004',
    nftMint: 'ULPinTreasury111111111111111111111111111113',
    owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b8',
    lastVerified: '2024-12-14',
    satelliteImage: 'https://ipfs.io/ipfs/QmSatelliteImage3'
  },
  {
    id: '5',
    title: 'Residential Complex',
    location: 'Surat, Gujarat',
    coordinates: [21.1702, 72.8311],
    area: '15,000',
    status: 'disputed',
    price: '₹12,50,00,000',
    type: 'residential',
    ulpin: 'GJ-01-005-2024-005',
    owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b9',
    lastVerified: '2024-12-08'
  }
]

export default function PropertyMap({ 
  properties = gujaratProperties, 
  onPropertySelect,
  center = [23.0225, 72.5714], // Ahmedabad center
  zoom = 8,
  height = '500px',
  showSatellite = false,
  enableSearch = true
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProperties, setFilteredProperties] = useState(properties)
  const [mapLayers, setMapLayers] = useState({
    satellite: showSatellite,
    street: !showSatellite,
    terrain: false
  })

  const getMarkerColor = (status: Property['status'], type: Property['type']) => {
    const statusColors = {
      verified: '#16A34A', // Green
      pending: '#EAB308',  // Yellow
      disputed: '#DC2626'  // Red
    }
    
    return statusColors[status]
  }

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredProperties(properties)
      return
    }

    const filtered = properties.filter(property =>
      property.title.toLowerCase().includes(query.toLowerCase()) ||
      property.location.toLowerCase().includes(query.toLowerCase()) ||
      property.ulpin?.toLowerCase().includes(query.toLowerCase()) ||
      property.type.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredProperties(filtered)
  }

  // Layer control functions
  const toggleLayer = (layerType: 'satellite' | 'street' | 'terrain') => {
    setMapLayers(prev => ({
      satellite: layerType === 'satellite' ? !prev.satellite : false,
      street: layerType === 'street' ? !prev.street : false,
      terrain: layerType === 'terrain' ? !prev.terrain : false
    }))
  }

  const createCustomIcon = (property: Property) => {
    const color = getMarkerColor(property.status, property.type)
    const typeIcon = {
      residential: '🏠',
      commercial: '🏢',
      agricultural: '🌾'
    }

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 16px;
            color: white;
          ">${typeIcon[property.type]}</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    })
  }

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom)
    mapInstanceRef.current = map

    // Define tile layers
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    })

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri'
    })

    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap'
    })

    // Add default layer based on props
    if (mapLayers.satellite) {
      satelliteLayer.addTo(map)
    } else if (mapLayers.terrain) {
      terrainLayer.addTo(map)
    } else {
      streetLayer.addTo(map)
    }

    // Layer control
    const baseLayers = {
      'Street': streetLayer,
      'Satellite': satelliteLayer,
      'Terrain': terrainLayer
    }

    L.control.layers(baseLayers).addTo(map)

    // Add properties as markers
    properties.forEach(property => {
      const marker = L.marker(property.coordinates, {
        icon: createCustomIcon(property)
      }).addTo(map)

      // Create popup content
      const popupContent = `
        <div class="p-4 min-w-80">
          <h3 class="font-semibold text-lg mb-3">${property.title}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex items-center">
              <span class="text-gray-600">📍 ${property.location}</span>
            </div>
            <div class="flex items-center">
              <span class="text-gray-600">📐 ${property.area} sq ft</span>
            </div>
            ${property.price ? `
              <div class="flex items-center">
                <span class="text-gray-600">💰 ${property.price}</span>
              </div>
            ` : ''}
            ${property.ulpin ? `
              <div class="flex items-center">
                <span class="text-gray-600">🆔 ULPIN: ${property.ulpin}</span>
              </div>
            ` : ''}
            ${property.nftMint ? `
              <div class="flex items-center">
                <span class="text-gray-600">🪙 NFT: ${property.nftMint.slice(0, 8)}...${property.nftMint.slice(-8)}</span>
              </div>
            ` : ''}
            ${property.lastVerified ? `
              <div class="flex items-center">
                <span class="text-gray-600">✅ Verified: ${property.lastVerified}</span>
              </div>
            ` : ''}
            <div class="flex items-center mt-2">
              <span class="px-2 py-1 rounded text-xs font-medium ${
                property.status === 'verified' ? 'bg-green-100 text-green-800' :
                property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }">
                ${property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </span>
              <span class="ml-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                ${property.type.charAt(0).toUpperCase() + property.type.slice(1)}
              </span>
            </div>
          </div>
          <div class="mt-3 space-y-2">
            <button 
              onclick="window.selectProperty('${property.id}')"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              View Details
            </button>
            ${property.satelliteImage ? `
              <button 
                onclick="window.viewSatellite('${property.id}')"
                class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm"
              >
                View Satellite Image
              </button>
            ` : ''}
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      })

      marker.on('click', () => {
        setSelectedProperty(property)
        if (onPropertySelect) {
          onPropertySelect(property)
        }
      })
    })

    // Add global function for popup button clicks
    ;(window as any).selectProperty = (propertyId: string) => {
      const property = properties.find(p => p.id === propertyId)
      if (property) {
        setSelectedProperty(property)
        if (onPropertySelect) {
          onPropertySelect(property)
        }
      }
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [properties, onPropertySelect, center, zoom])

  return (
    <div className="relative">
      {/* Search Interface */}
      {enableSearch && (
        <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-80">
          <div className="mb-3">
            <h4 className="font-semibold text-sm mb-2">Search Properties</h4>
            <input
              type="text"
              placeholder="Search by title, location, ULPIN..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {searchQuery && (
            <div className="max-h-48 overflow-y-auto">
              <div className="text-xs text-gray-500 mb-2">
                Found {filteredProperties.length} properties
              </div>
              {filteredProperties.map(property => (
                <div
                  key={property.id}
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView(property.coordinates, 15)
                      setSelectedProperty(property)
                      if (onPropertySelect) {
                        onPropertySelect(property)
                      }
                    }
                  }}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm">{property.title}</div>
                  <div className="text-xs text-gray-600">{property.location}</div>
                  <div className="text-xs text-gray-500">{property.ulpin}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div 
        ref={mapRef} 
        style={{ height }}
        className="w-full rounded-lg shadow-lg border border-gray-200"
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-[1000]">
        <h4 className="font-semibold mb-3 text-sm">Property Status</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Verified</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Disputed</span>
          </div>
        </div>
        
        <h4 className="font-semibold mb-3 mt-4 text-sm">Property Type</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center">
            <span className="mr-2">🏠</span>
            <span>Residential</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🏢</span>
            <span>Commercial</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🌾</span>
            <span>Agricultural</span>
          </div>
        </div>
      </div>

      {/* Selected Property Info */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-[1000] max-w-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-sm">{selectedProperty.title}</h4>
            <button 
              onClick={() => setSelectedProperty(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>📍 {selectedProperty.location}</div>
            <div>📐 {selectedProperty.area} sq ft</div>
            {selectedProperty.price && <div>💰 {selectedProperty.price}</div>}
          </div>
          <button className="mt-2 w-full btn-primary py-1 text-xs">
            View Full Details
          </button>
        </div>
      )}
    </div>
  )
}
