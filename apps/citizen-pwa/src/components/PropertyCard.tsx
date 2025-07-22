'use client'

interface PropertyCardProps {
  title: string
  location: string
  area: string
  status: 'verified' | 'pending' | 'disputed'
}

export default function PropertyCard({ title, location, area, status }: PropertyCardProps) {
  const statusColors = {
    verified: 'bg-gujarat-green-100 text-gujarat-green-800',
    pending: 'bg-gujarat-gold-100 text-gujarat-gold-800',
    disputed: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    verified: 'Verified',
    pending: 'Pending',
    disputed: 'Disputed'
  }

  return (
    <div className="card hover:shadow-soft-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-gujarat-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </div>
        
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-gujarat-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          {area} sq ft
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="btn-primary w-full">
          View Details
        </button>
      </div>
    </div>
  )
}
