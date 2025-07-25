"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// Stable form component defined outside to prevent re-mounting
const ListingForm = React.memo(({
  formData,
  formErrors,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: {
  formData: {
    ulpin: string;
    title: string;
    location: string;
    area: string;
    price: string;
    description: string;
    images: string[];
  };
  formErrors: {[key: string]: string};
  loading: boolean;
  onChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">List Your Property</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ULPIN Number
            </label>
            <input
              type="text"
              value={formData.ulpin}
              onChange={(e) => onChange('ulpin', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.ulpin ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="GJ-24-XXX-XXX"
              required
            />
            {formErrors.ulpin && (
              <p className="text-red-500 text-sm mt-1">{formErrors.ulpin}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Residential Plot - Sector 15"
              required
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => onChange('location', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Gandhinagar, Gujarat"
              required
            />
            {formErrors.location && (
              <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area (sq ft)
            </label>
            <input
              type="number"
              value={formData.area}
              onChange={(e) => onChange('area', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.area ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="2400"
              required
            />
            {formErrors.area && (
              <p className="text-red-500 text-sm mt-1">{formErrors.area}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (SOL)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.price}
              onChange={(e) => onChange('price', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="2.5"
              required
            />
            {formErrors.price && (
              <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Describe your property..."
            required
          />
          {formErrors.description && (
            <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
          )}
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'List Property'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
});

interface LandListing {
  id: string;
  ulpin: string;
  title: string;
  location: string;
  area: number;
  price: number; // in SOL
  seller: string;
  description: string;
  images: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'available' | 'sold' | 'pending';
  createdAt: Date;
}

interface LandListingInterfaceProps {
  mode: 'list' | 'buy';
}

export default function LandListingInterface({ mode }: LandListingInterfaceProps) {
  const { publicKey, connected } = useWallet();
  const [listings, setListings] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [showListingForm, setShowListingForm] = useState(false);
  const [formData, setFormData] = useState({
    ulpin: '',
    title: '',
    location: '',
    area: '',
    price: '',
    description: '',
    images: [] as string[]
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Simple input handler without useCallback to prevent re-mounting
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear only the current field's error
    setFormErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Mock data for demonstration
  useEffect(() => {
    const mockListings: LandListing[] = [
      {
        id: '1',
        ulpin: 'GJ-24-001-001',
        title: 'Residential Plot - Sector 15',
        location: 'Gandhinagar, Gujarat',
        area: 2400,
        price: 2.5,
        seller: '0x1234567890abcdef',
        description: 'Beautiful residential plot in prime location with all amenities nearby.',
        images: ['/api/placeholder/400/300'],
        coordinates: { lat: 23.2156, lng: 72.6369 },
        status: 'available',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        ulpin: 'GJ-24-002-001',
        title: 'Commercial Building',
        location: 'Ahmedabad, Gujarat',
        area: 8500,
        price: 8.0,
        seller: '0xabcdef1234567890',
        description: 'Prime commercial property in business district with high foot traffic.',
        images: ['/api/placeholder/400/300'],
        coordinates: { lat: 23.0225, lng: 72.5714 },
        status: 'available',
        createdAt: new Date('2024-01-20')
      },
      {
        id: '3',
        ulpin: 'GJ-24-003-001',
        title: 'Agricultural Land',
        location: 'Vadodara, Gujarat',
        area: 12000,
        price: 5.5,
        seller: '0x9876543210fedcba',
        description: 'Fertile agricultural land with irrigation facilities and road access.',
        images: ['/api/placeholder/400/300'],
        coordinates: { lat: 22.3072, lng: 73.1812 },
        status: 'available',
        createdAt: new Date('2024-01-25')
      }
    ];
    setListings(mockListings);
  }, []);

  const handleBuyProperty = async (listing: LandListing) => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update listing status
      setListings(prev => prev.map(l => 
        l.id === listing.id ? { ...l, status: 'sold' } : l
      ));

      alert(`Transaction successful! Property purchased for ${listing.price} SOL`);
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.ulpin.trim()) {
      errors.ulpin = 'ULPIN is required';
    } else if (!/^GJ-\d{2}-\d{3}-\d{3}$/.test(formData.ulpin)) {
      errors.ulpin = 'ULPIN must be in format GJ-XX-XXX-XXX';
    }
    
    if (!formData.title.trim()) {
      errors.title = 'Property title is required';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!formData.area.trim()) {
      errors.area = 'Area is required';
    } else if (parseFloat(formData.area) <= 0) {
      errors.area = 'Area must be greater than 0';
    }
    
    if (!formData.price.trim()) {
      errors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const newListing: LandListing = {
        id: Date.now().toString(),
        ulpin: formData.ulpin,
        title: formData.title,
        location: formData.location,
        area: parseFloat(formData.area),
        price: parseFloat(formData.price),
        seller: publicKey.toString(),
        description: formData.description,
        images: formData.images,
        coordinates: { lat: 23.2156, lng: 72.6369 }, // Mock coordinates
        status: 'available',
        createdAt: new Date()
      };

      setListings(prev => [newListing, ...prev]);
      setFormData({
        ulpin: '',
        title: '',
        location: '',
        area: '',
        price: '',
        description: '',
        images: []
      });
      setFormErrors({});
      setShowListingForm(false);
      alert('Property listed successfully!');
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const ListingCard = ({ listing }: { listing: LandListing }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Property Image</div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">{listing.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            listing.status === 'available' ? 'bg-green-100 text-green-800' :
            listing.status === 'sold' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {listing.status}
          </span>
        </div>
        <p className="text-gray-600 mb-2">{listing.location}</p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500">ULPIN: {listing.ulpin}</span>
          <span className="text-sm text-gray-500">{listing.area} sq ft</span>
        </div>
        <p className="text-gray-700 mb-4 line-clamp-2">{listing.description}</p>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">{listing.price} SOL</div>
          {mode === 'buy' && listing.status === 'available' && (
            <button
              onClick={() => handleBuyProperty(listing)}
              disabled={loading || !connected}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'list' ? 'List Your Property' : 'Buy Properties'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'list' 
              ? 'List your property for sale on the blockchain' 
              : 'Browse and purchase properties using SOL'
            }
          </p>
        </div>

      </div>

      {mode === 'list' && (
        <div className="mb-8">
          {!showListingForm ? (
            <button
              onClick={() => setShowListingForm(true)}
              disabled={!connected}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {connected ? 'List New Property' : 'Connect Wallet to List Property'}
            </button>
          ) : (
            <ListingForm
              formData={formData}
              formErrors={formErrors}
              loading={loading}
              onChange={handleInputChange}
              onSubmit={handleCreateListing}
              onCancel={() => setShowListingForm(false)}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties available</p>
        </div>
      )}
    </div>
  );
} 