'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PropertyCardProps {
  title: string
  location: string
  area: string
  status: 'verified' | 'pending' | 'disputed'
  ulpin?: string
  price?: string
  lastUpdated?: string
  owner?: string
  coordinates?: [number, number]
  imageUrl?: string
  onViewDetails?: () => void
}

export default function PropertyCard({ 
  title, 
  location, 
  area, 
  status, 
  ulpin, 
  price, 
  lastUpdated, 
  owner, 
  coordinates, 
  imageUrl, 
  onViewDetails 
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const statusColors = {
    verified: 'bg-gujarat-green-100 text-gujarat-green-800 border-gujarat-green-200',
    pending: 'bg-gujarat-gold-100 text-gujarat-gold-800 border-gujarat-gold-200',
    disputed: 'bg-red-100 text-red-800 border-red-200'
  }

  const statusLabels = {
    verified: '✅ Verified',
    pending: '⏳ Pending',
    disputed: '⚠️ Disputed'
  }

  return (
    <div 
      className={`card hover:shadow-soft-lg transition-all duration-300 ${
        isHovered ? 'transform scale-105' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Property Image */}
      {imageUrl && (
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/api/placeholder/400/300'
            }}
          />
          <div className="absolute top-2 right-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {!imageUrl && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        )}
      </div>
      
      <div className="space-y-3 text-sm text-gray-600">
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
        
        {ulpin && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gujarat-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-mono text-xs">ULPIN: {ulpin}</span>
          </div>
        )}
        
        {price && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gujarat-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="font-semibold text-gujarat-green-600">₹{price}</span>
          </div>
        )}
        
        {owner && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gujarat-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">Owner: {owner}</span>
          </div>
        )}
        
        {lastUpdated && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-500">Updated: {lastUpdated}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button 
            className="btn-primary flex-1"
            onClick={onViewDetails}
          >
            View Details
          </button>
          {coordinates && (
            <Link 
              href={`/map?lat=${coordinates[0]}&lng=${coordinates[1]}`}
              className="btn-secondary px-3 py-2"
              title="View on Map"
            >
              🗺️
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
