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
