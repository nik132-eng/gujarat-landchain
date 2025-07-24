// GL-0801: Land Listing Interface for Official Dashboard
// Sprint 8: Land Marketplace Implementation
// Gujarat LandChain × Land Listing System

/*
Land Listing Interface
- Objective: Comprehensive interface for land owners to list their properties
- Features: Property listing, search, filtering, verification, transaction management
- Integration: ULPIN system, blockchain verification, customer inquiries
*/

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '../hooks/useSession';

// Types and Interfaces
interface LandProperty {
  id: string;
  ulpin: string;
  title: string;
  description: string;
  location: {
    district: string;
    taluka: string;
    village: string;
    surveyNumber: string;
    area: number; // in square meters
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  ownership: {
    ownerName: string;
    ownerId: string;
    ownershipType: 'individual' | 'joint' | 'company';
    ownershipPercentage: number;
  };
  listing: {
    status: 'draft' | 'active' | 'sold' | 'inactive';
    price: number;
    currency: 'INR' | 'USD';
    listingDate: string;
    expiryDate: string;
    isNegotiable: boolean;
    preferredPaymentMethod: string[];
  };
  features: {
    landType: 'agricultural' | 'residential' | 'commercial' | 'industrial' | 'mixed';
    soilType: string;
    waterAvailability: boolean;
    roadAccess: boolean;
    electricity: boolean;
    nearbyFacilities: string[];
  };
  documents: {
    titleDeed: boolean;
    surveyReport: boolean;
    taxReceipts: boolean;
    encumbranceCertificate: boolean;
    approvedPlan?: boolean;
  };
  verification: {
    isVerified: boolean;
    verificationDate?: string;
    verifiedBy?: string;
    verificationNotes?: string;
  };
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface ListingFilter {
  status: string;
  landType: string;
  district: string;
  priceRange: {
    min: number;
    max: number;
  };
  areaRange: {
    min: number;
    max: number;
  };
}

interface CustomerInquiry {
  id: string;
  propertyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  inquiryDate: string;
  status: 'pending' | 'responded' | 'closed';
  response?: string;
  responseDate?: string;
}

const LandListingInterface: React.FC = () => {
  const { currentSession, hasPermission } = useSession();
  
  // State management
  const [properties, setProperties] = useState<LandProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<LandProperty | null>(null);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<ListingFilter>({
    status: 'all',
    landType: 'all',
    district: 'all',
    priceRange: { min: 0, max: 10000000 },
    areaRange: { min: 0, max: 100000 }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showListingModal, setShowListingModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries' | 'analytics'>('listings');

  // Form states for new listing
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    district: '',
    taluka: '',
    village: '',
    surveyNumber: '',
    area: '',
    price: '',
    landType: 'agricultural' as LandProperty['features']['landType'],
    isNegotiable: false,
    preferredPaymentMethod: [] as string[]
  });

  // Check permissions
  const canCreateListing = hasPermission('create_listing');
  const canEditListing = hasPermission('edit_listing');
  const canDeleteListing = hasPermission('delete_listing');
  const canViewInquiries = hasPermission('view_inquiries');
  const canRespondToInquiries = hasPermission('respond_inquiries');

  // Load properties data
  const loadProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockProperties = generateMockProperties();
      setProperties(mockProperties);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load inquiries data
  const loadInquiries = useCallback(async () => {
    if (!canViewInquiries) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockInquiries = generateMockInquiries();
      setInquiries(mockInquiries);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [canViewInquiries]);

  // Create new listing
  const createListing = async () => {
    if (!canCreateListing) return;

    setIsLoading(true);
    try {
      const newProperty: LandProperty = {
        id: `prop_${Date.now()}`,
        ulpin: `ULPIN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        title: newListing.title,
        description: newListing.description,
        location: {
          district: newListing.district,
          taluka: newListing.taluka,
          village: newListing.village,
          surveyNumber: newListing.surveyNumber,
          area: parseFloat(newListing.area),
        },
        ownership: {
          ownerName: currentSession?.name || 'Unknown',
          ownerId: currentSession?.userId || '',
          ownershipType: 'individual',
          ownershipPercentage: 100
        },
        listing: {
          status: 'draft',
          price: parseFloat(newListing.price),
          currency: 'INR',
          listingDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          isNegotiable: newListing.isNegotiable,
          preferredPaymentMethod: newListing.preferredPaymentMethod
        },
        features: {
          landType: newListing.landType,
          soilType: 'Alluvial',
          waterAvailability: true,
          roadAccess: true,
          electricity: false,
          nearbyFacilities: []
        },
        documents: {
          titleDeed: true,
          surveyReport: true,
          taxReceipts: true,
          encumbranceCertificate: true
        },
        verification: {
          isVerified: false
        },
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setProperties(prev => [newProperty, ...prev]);
      setShowListingModal(false);
      setNewListing({
        title: '',
        description: '',
        district: '',
        taluka: '',
        village: '',
        surveyNumber: '',
        area: '',
        price: '',
        landType: 'agricultural',
        isNegotiable: false,
        preferredPaymentMethod: []
      });
    } catch (error) {
      console.error('Failed to create listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update listing status
  const updateListingStatus = async (propertyId: string, status: LandProperty['listing']['status']) => {
    if (!canEditListing) return;

    setProperties(prev => 
      prev.map(prop => 
        prop.id === propertyId 
          ? { ...prop, listing: { ...prop.listing, status }, updatedAt: new Date().toISOString() }
          : prop
      )
    );
  };

  // Respond to inquiry
  const respondToInquiry = async (inquiryId: string, response: string) => {
    if (!canRespondToInquiries) return;

    setInquiries(prev => 
      prev.map(inq => 
        inq.id === inquiryId 
          ? { 
              ...inq, 
              status: 'responded', 
              response, 
              responseDate: new Date().toISOString() 
            }
          : inq
      )
    );
    setShowInquiryModal(false);
    setSelectedInquiry(null);
  };

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.ulpin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.village.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filter.status === 'all' || property.listing.status === filter.status;
    const matchesLandType = filter.landType === 'all' || property.features.landType === filter.landType;
    const matchesDistrict = filter.district === 'all' || property.location.district === filter.district;
    const matchesPrice = property.listing.price >= filter.priceRange.min && 
                        property.listing.price <= filter.priceRange.max;
    const matchesArea = property.location.area >= filter.areaRange.min && 
                       property.location.area <= filter.areaRange.max;

    return matchesSearch && matchesStatus && matchesLandType && matchesDistrict && matchesPrice && matchesArea;
  });

  // Load data on component mount
  useEffect(() => {
    loadProperties();
    if (canViewInquiries) {
      loadInquiries();
    }
  }, [loadProperties, loadInquiries, canViewInquiries]);

  // Utility functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatArea = (area: number) => {
    if (area >= 10000) {
      return `${(area / 10000).toFixed(2)} hectares`;
    }
    return `${area.toFixed(2)} sq meters`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLandTypeColor = (landType: string) => {
    switch (landType) {
      case 'agricultural': return 'bg-green-100 text-green-800';
      case 'residential': return 'bg-blue-100 text-blue-800';
      case 'commercial': return 'bg-purple-100 text-purple-800';
      case 'industrial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Land Listing Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your land listings and respond to customer inquiries
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'listings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Listings ({properties.length})
            </button>
            {canViewInquiries && (
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inquiries'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Customer Inquiries ({inquiries.filter(i => i.status === 'pending').length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            {/* Search and Filter Bar */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search by title, ULPIN, or village..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="sold">Sold</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Land Type
                  </label>
                  <select
                    value={filter.landType}
                    onChange={(e) => setFilter(prev => ({ ...prev, landType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Types</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
                <div className="flex items-end">
                  {canCreateListing && (
                    <button
                      onClick={() => setShowListingModal(true)}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Create New Listing
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {property.title}
                          </h3>
                          <p className="text-sm text-gray-500">{property.ulpin}</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.listing.status)}`}>
                            {property.listing.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLandTypeColor(property.features.landType)}`}>
                            {property.features.landType}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Location:</span>
                          <span className="text-sm font-medium">{property.location.village}, {property.location.taluka}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Area:</span>
                          <span className="text-sm font-medium">{formatArea(property.location.area)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="text-sm font-medium">{formatPrice(property.listing.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Verification:</span>
                          <span className={`text-sm font-medium ${property.verification.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                            {property.verification.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedProperty(property)}
                          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          View Details
                        </button>
                        {canEditListing && (
                          <button
                            onClick={() => updateListingStatus(property.id, property.listing.status === 'active' ? 'inactive' : 'active')}
                            className={`flex-1 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 ${
                              property.listing.status === 'active'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                            }`}
                          >
                            {property.listing.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or create a new listing.</p>
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === 'inquiries' && canViewInquiries && (
          <div>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Customer Inquiries</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{inquiry.customerName}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            inquiry.status === 'responded' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{inquiry.message}</p>
                        <div className="text-xs text-gray-500">
                          {new Date(inquiry.inquiryDate).toLocaleDateString()} • {inquiry.customerEmail}
                        </div>
                      </div>
                      {inquiry.status === 'pending' && canRespondToInquiries && (
                        <button
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setShowInquiryModal(true);
                          }}
                          className="ml-4 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          Respond
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Listings</h3>
              <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Active Listings</h3>
              <p className="text-3xl font-bold text-green-600">
                {properties.filter(p => p.listing.status === 'active').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Pending Inquiries</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {inquiries.filter(i => i.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {formatPrice(properties.reduce((sum, p) => sum + p.listing.price, 0))}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      {showListingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Listing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newListing.title}
                    onChange={(e) => setNewListing(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter property title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newListing.description}
                    onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Enter property description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      value={newListing.district}
                      onChange={(e) => setNewListing(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taluka</label>
                    <input
                      type="text"
                      value={newListing.taluka}
                      onChange={(e) => setNewListing(prev => ({ ...prev, taluka: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                    <input
                      type="text"
                      value={newListing.village}
                      onChange={(e) => setNewListing(prev => ({ ...prev, village: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Survey Number</label>
                    <input
                      type="text"
                      value={newListing.surveyNumber}
                      onChange={(e) => setNewListing(prev => ({ ...prev, surveyNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq meters)</label>
                    <input
                      type="number"
                      value={newListing.area}
                      onChange={(e) => setNewListing(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR)</label>
                    <input
                      type="number"
                      value={newListing.price}
                      onChange={(e) => setNewListing(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Type</label>
                  <select
                    value={newListing.landType}
                    onChange={(e) => setNewListing(prev => ({ ...prev, landType: e.target.value as LandProperty['features']['landType'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="agricultural">Agricultural</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newListing.isNegotiable}
                    onChange={(e) => setNewListing(prev => ({ ...prev, isNegotiable: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Price is negotiable</label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={createListing}
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Listing'}
                </button>
                <button
                  onClick={() => setShowListingModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Respond to Inquiry Modal */}
      {showInquiryModal && selectedInquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Respond to Inquiry</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>From:</strong> {selectedInquiry.customerName} ({selectedInquiry.customerEmail})
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Message:</strong> {selectedInquiry.message}
                </p>
                <textarea
                  placeholder="Enter your response..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  id="response-text"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const response = (document.getElementById('response-text') as HTMLTextAreaElement).value;
                    if (response.trim()) {
                      respondToInquiry(selectedInquiry.id, response);
                    }
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Send Response
                </button>
                <button
                  onClick={() => {
                    setShowInquiryModal(false);
                    setSelectedInquiry(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data generators
const generateMockProperties = (): LandProperty[] => [
  {
    id: 'prop_1',
    ulpin: 'ULPIN_GJ001234567',
    title: 'Agricultural Land in Anand District',
    description: 'Prime agricultural land with good soil quality and water availability. Suitable for various crops.',
    location: {
      district: 'Anand',
      taluka: 'Anand',
      village: 'Vadod',
      surveyNumber: '123/45',
      area: 25000,
      coordinates: { latitude: 22.5565, longitude: 72.9489 }
    },
    ownership: {
      ownerName: 'Rajesh Patel',
      ownerId: 'user_1',
      ownershipType: 'individual',
      ownershipPercentage: 100
    },
    listing: {
      status: 'active',
      price: 2500000,
      currency: 'INR',
      listingDate: '2024-01-15T10:00:00Z',
      expiryDate: '2024-04-15T10:00:00Z',
      isNegotiable: true,
      preferredPaymentMethod: ['bank_transfer', 'cheque']
    },
    features: {
      landType: 'agricultural',
      soilType: 'Alluvial',
      waterAvailability: true,
      roadAccess: true,
      electricity: false,
      nearbyFacilities: ['school', 'hospital', 'market']
    },
    documents: {
      titleDeed: true,
      surveyReport: true,
      taxReceipts: true,
      encumbranceCertificate: true
    },
    verification: {
      isVerified: true,
      verificationDate: '2024-01-10T10:00:00Z',
      verifiedBy: 'verifier_1',
      verificationNotes: 'All documents verified and property surveyed'
    },
    images: ['image1.jpg', 'image2.jpg'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'prop_2',
    ulpin: 'ULPIN_GJ001234568',
    title: 'Residential Plot in Vadodara',
    description: 'Well-located residential plot with all basic amenities nearby. Ready for construction.',
    location: {
      district: 'Vadodara',
      taluka: 'Vadodara',
      village: 'Gotri',
      surveyNumber: '456/78',
      area: 500,
      coordinates: { latitude: 22.3039, longitude: 73.2013 }
    },
    ownership: {
      ownerName: 'Priya Sharma',
      ownerId: 'user_2',
      ownershipType: 'individual',
      ownershipPercentage: 100
    },
    listing: {
      status: 'active',
      price: 1500000,
      currency: 'INR',
      listingDate: '2024-01-20T10:00:00Z',
      expiryDate: '2024-04-20T10:00:00Z',
      isNegotiable: false,
      preferredPaymentMethod: ['bank_transfer']
    },
    features: {
      landType: 'residential',
      soilType: 'Laterite',
      waterAvailability: true,
      roadAccess: true,
      electricity: true,
      nearbyFacilities: ['school', 'hospital', 'market', 'bus_stop']
    },
    documents: {
      titleDeed: true,
      surveyReport: true,
      taxReceipts: true,
      encumbranceCertificate: true,
      approvedPlan: true
    },
    verification: {
      isVerified: false
    },
    images: ['image3.jpg'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  }
];

const generateMockInquiries = (): CustomerInquiry[] => [
  {
    id: 'inq_1',
    propertyId: 'prop_1',
    customerName: 'Amit Kumar',
    customerEmail: 'amit.kumar@email.com',
    customerPhone: '+91-9876543210',
    message: 'I am interested in your agricultural land. Can you provide more details about the soil quality and water availability? Also, is the price negotiable?',
    inquiryDate: '2024-01-25T14:30:00Z',
    status: 'pending'
  },
  {
    id: 'inq_2',
    propertyId: 'prop_2',
    customerName: 'Sneha Patel',
    customerEmail: 'sneha.patel@email.com',
    customerPhone: '+91-9876543211',
    message: 'I would like to visit the residential plot. Can you arrange a site visit this weekend?',
    inquiryDate: '2024-01-24T11:15:00Z',
    status: 'responded',
    response: 'Sure, I can arrange a site visit this Saturday at 10 AM. Please confirm if this time works for you.',
    responseDate: '2024-01-24T16:45:00Z'
  }
];

export default LandListingInterface; 