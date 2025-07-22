'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic import to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gujarat-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading interactive map...</p>
      </div>
    </div>
  )
})

export default function MapPage() {
  const handlePropertySelect = (property: any) => {
    console.log('Selected property:', property)
    // Here you could navigate to property details page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Property Map</h1>
              <p className="text-gray-600 mt-1">Explore verified properties across Gujarat</p>
            </div>
            <div className="flex space-x-4">
              <button className="btn-secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              <button className="btn-primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Interactive Property Map</h2>
            <p className="text-gray-600">
              Click on any property marker to view details. Different colors indicate verification status.
            </p>
          </div>
          
          <Suspense fallback={
            <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-pulse text-gray-500">Loading map...</div>
            </div>
          }>
            <PropertyMap
              onPropertySelect={handlePropertySelect}
              height="500px"
              zoom={8}
            />
          </Suspense>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gujarat-blue-600 mb-2">5</div>
            <div className="text-gray-600 text-sm">Total Properties</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gujarat-green-500 mb-2">3</div>
            <div className="text-gray-600 text-sm">Verified</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gujarat-gold-500 mb-2">1</div>
            <div className="text-gray-600 text-sm">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-red-500 mb-2">1</div>
            <div className="text-gray-600 text-sm">Disputed</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Property Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-gujarat-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-sm">Property Verified</div>
                <div className="text-gray-600 text-xs">IT Park Plot, GIFT City - 2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-gujarat-gold-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-sm">New Property Listed</div>
                <div className="text-gray-600 text-xs">Commercial Building, Ahmedabad - 5 hours ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium text-sm">Dispute Raised</div>
                <div className="text-gray-600 text-xs">Residential Complex, Surat - 1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
