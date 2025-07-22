import { useState, useEffect } from 'react'

interface Property {
  id: string
  ulpin: string
  title: string
  address: string
  coordinates: [number, number]
  area: number
  price: number
  status: 'available' | 'pending' | 'sold' | 'disputed'
  owner: string
  lastUpdated: string
  propertyType: 'residential' | 'commercial' | 'agricultural' | 'industrial'
  zone: string
  survey_number: string
  sub_division: string
}

interface PropertyMapProps {
  properties: Property[]
  selectedProperty?: Property | null
  onPropertySelect: (property: Property) => void
  center?: [number, number]
  zoom?: number
  height?: string
  showSearch?: boolean
  showFilters?: boolean
  interactive?: boolean
}

export default function PropertyMap({
  properties,
  selectedProperty,
  onPropertySelect,
  center = [23.0225, 72.5714], // Ahmedabad coordinates as default
  zoom = 10,
  height = '500px',
  showSearch = true,
  showFilters = true,
  interactive = true
}: PropertyMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    propertyType: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    zone: ''
  })

  // Ensure this only renders on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    setFilteredProperties(properties)
  }, [properties])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredProperties(properties)
      return
    }

    const filtered = properties.filter(property =>
      property.ulpin.toLowerCase().includes(query.toLowerCase()) ||
      property.address.toLowerCase().includes(query.toLowerCase()) ||
      property.owner.toLowerCase().includes(query.toLowerCase()) ||
      property.title.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredProperties(filtered)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    let filtered = properties

    if (newFilters.propertyType) {
      filtered = filtered.filter(p => p.propertyType === newFilters.propertyType)
    }
    if (newFilters.status) {
      filtered = filtered.filter(p => p.status === newFilters.status)
    }
    if (newFilters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(newFilters.minPrice))
    }
    if (newFilters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(newFilters.maxPrice))
    }
    if (newFilters.zone) {
      filtered = filtered.filter(p => 
        p.zone.toLowerCase().includes(newFilters.zone.toLowerCase())
      )
    }

    setFilteredProperties(filtered)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-500',
      pending: 'bg-yellow-500',
      sold: 'bg-gray-500',
      disputed: 'bg-red-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  // Don't render on server side
  if (!isClient) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Map placeholder with controls */}
      <div className="w-full h-full bg-gray-200 rounded-lg relative overflow-hidden">
        {/* Search and filter controls */}
        {(showSearch || showFilters) && (
          <div className="absolute top-4 left-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 space-y-4">
            {showSearch && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by ULPIN, address, or owner..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  🔍
                </div>
              </div>
            )}
            
            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Types</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="industrial">Industrial</option>
                </select>
                
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="disputed">Disputed</option>
                </select>
                
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                
                <input
                  type="text"
                  placeholder="Zone"
                  value={filters.zone}
                  onChange={(e) => handleFilterChange('zone', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Map placeholder content */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Property Map</h3>
            <p className="text-gray-500 max-w-md">
              Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} in Gujarat
            </p>
          </div>
        </div>

        {/* Property markers placeholder */}
        <div className="absolute inset-0 pointer-events-none">
          {filteredProperties.slice(0, 10).map((property, index) => (
            <div
              key={property.id}
              className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${20 + (index % 5) * 15}%`,
                top: `${30 + Math.floor(index / 5) * 20}%`,
              }}
              onClick={() => onPropertySelect(property)}
            >
              <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${getStatusColor(property.status)}`}>
              </div>
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 min-w-48 opacity-0 hover:opacity-100 transition-opacity duration-200 z-20">
                <h4 className="font-semibold text-sm">{property.title}</h4>
                <p className="text-xs text-gray-600">ULPIN: {property.ulpin}</p>
                <p className="text-xs text-gray-600">{property.address}</p>
                <p className="text-xs font-medium">{formatPrice(property.price)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.status === 'available' ? 'text-green-600 bg-green-100' :
                    property.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                    property.status === 'sold' ? 'text-gray-600 bg-gray-100' :
                    'text-red-600 bg-red-100'
                  }`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <h4 className="text-sm font-medium mb-2">Property Status</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-xs">Sold</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Disputed</span>
            </div>
          </div>
        </div>
        
        {/* Property count */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
          <span className="text-sm font-medium">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'}
          </span>
        </div>
      </div>
    </div>
  )
}
