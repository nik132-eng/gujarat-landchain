'use client';

import React, { useState, useEffect } from 'react';
import { useRBAC, Permission } from './RBACSystem';

// Property interface
interface Property {
  id: string;
  ulpinId: string;
  ownerName: string;
  surveyNumber: string;
  village: string;
  taluka: string;
  district: string;
  area: number; // in square meters
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedDate: Date;
  documents: string[];
  evidenceBundleId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Batch operation interface
interface BatchOperation {
  id: string;
  type: 'approve' | 'reject' | 'escalate';
  properties: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

// Mock data (will be replaced with real backend)
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    ulpinId: 'GJ-24-001-001-001',
    ownerName: 'Rajesh Patel',
    surveyNumber: '123/1',
    village: 'Vadodara',
    taluka: 'Vadodara',
    district: 'Vadodara',
    area: 2500,
    status: 'pending',
    submittedDate: new Date(Date.now() - 86400000), // 1 day ago
    documents: ['sale-deed.pdf', 'survey-map.pdf'],
    priority: 'high'
  },
  {
    id: '2',
    ulpinId: 'GJ-24-001-001-002',
    ownerName: 'Priya Sharma',
    surveyNumber: '124/2',
    village: 'Ahmedabad',
    taluka: 'Ahmedabad',
    district: 'Ahmedabad',
    area: 1800,
    status: 'pending',
    submittedDate: new Date(Date.now() - 172800000), // 2 days ago
    documents: ['inheritance-cert.pdf', 'boundary-map.pdf'],
    priority: 'medium'
  },
  {
    id: '3',
    ulpinId: 'GJ-24-001-001-003',
    ownerName: 'Amit Kumar',
    surveyNumber: '125/3',
    village: 'Surat',
    taluka: 'Surat',
    district: 'Surat',
    area: 3200,
    status: 'pending',
    submittedDate: new Date(Date.now() - 259200000), // 3 days ago
    documents: ['gift-deed.pdf', 'satellite-image.pdf'],
    priority: 'urgent'
  },
  {
    id: '4',
    ulpinId: 'GJ-24-001-001-004',
    ownerName: 'Sita Devi',
    surveyNumber: '126/4',
    village: 'Rajkot',
    taluka: 'Rajkot',
    district: 'Rajkot',
    area: 1500,
    status: 'pending',
    submittedDate: new Date(Date.now() - 345600000), // 4 days ago
    documents: ['partition-deed.pdf', 'measurement-cert.pdf'],
    priority: 'low'
  },
  {
    id: '5',
    ulpinId: 'GJ-24-001-001-005',
    ownerName: 'Vikram Singh',
    surveyNumber: '127/5',
    village: 'Bhavnagar',
    taluka: 'Bhavnagar',
    district: 'Bhavnagar',
    area: 4200,
    status: 'pending',
    submittedDate: new Date(Date.now() - 432000000), // 5 days ago
    documents: ['lease-agreement.pdf', 'site-plan.pdf'],
    priority: 'high'
  }
];

export const BatchApprovalQueue: React.FC = () => {
  const { hasPermission, currentUser } = useRBAC();
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [batchOperations, setBatchOperations] = useState<BatchOperation[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    district: 'all',
    search: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Check permissions
  const canApprove = hasPermission(Permission.APPROVE_PROPERTIES);
  const canReject = hasPermission(Permission.REJECT_PROPERTIES);
  const canView = hasPermission(Permission.VIEW_PROPERTIES);

  if (!canView) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have permission to view properties.</p>
      </div>
    );
  }

  // Filter properties based on current filters
  const filteredProperties = properties.filter(property => {
    if (filters.status !== 'all' && property.status !== filters.status) return false;
    if (filters.priority !== 'all' && property.priority !== filters.priority) return false;
    if (filters.district !== 'all' && property.district !== filters.district) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        property.ulpinId.toLowerCase().includes(searchLower) ||
        property.ownerName.toLowerCase().includes(searchLower) ||
        property.surveyNumber.toLowerCase().includes(searchLower) ||
        property.village.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Handle property selection
  const handlePropertySelect = (propertyId: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedProperties(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProperties.size === filteredProperties.length) {
      setSelectedProperties(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedProperties(new Set(filteredProperties.map(p => p.id)));
      setShowBulkActions(true);
    }
  };

  // Process batch operation
  const processBatchOperation = async (type: 'approve' | 'reject' | 'escalate') => {
    if (!currentUser || selectedProperties.size === 0) return;

    const operationId = Date.now().toString();
    const newOperation: BatchOperation = {
      id: operationId,
      type,
      properties: Array.from(selectedProperties),
      status: 'pending',
      progress: 0,
      createdBy: currentUser.name,
      createdAt: new Date()
    };

    setBatchOperations(prev => [...prev, newOperation]);
    setIsProcessing(true);

    // Simulate batch processing
    const totalProperties = selectedProperties.size;
    let processed = 0;

    for (const propertyId of selectedProperties) {
      try {
        // TODO: Replace with real API call
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Update property status
        setProperties(prev => prev.map(property => 
          property.id === propertyId 
            ? { ...property, status: type === 'approve' ? 'approved' : 'rejected' }
            : property
        ));

        processed++;
        const progress = Math.round((processed / totalProperties) * 100);
        
        setBatchOperations(prev => prev.map(op => 
          op.id === operationId 
            ? { ...op, progress }
            : op
        ));

      } catch (error) {
        console.error(`Error processing property ${propertyId}:`, error);
      }
    }

    // Mark operation as completed
    setBatchOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, status: 'completed', progress: 100, completedAt: new Date() }
        : op
    ));

    setIsProcessing(false);
    setSelectedProperties(new Set());
    setShowBulkActions(false);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Batch Approval Queue</h2>
          <p className="text-gray-600">
            {filteredProperties.length} properties pending review
          </p>
        </div>
        <div className="flex space-x-3">
          {showBulkActions && (
            <>
              {canApprove && (
                <button
                  onClick={() => processBatchOperation('approve')}
                  disabled={isProcessing}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Approve Selected ({selectedProperties.size})
                </button>
              )}
              {canReject && (
                <button
                  onClick={() => processBatchOperation('reject')}
                  disabled={isProcessing}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Selected ({selectedProperties.size})
                </button>
              )}
              <button
                onClick={() => processBatchOperation('escalate')}
                disabled={isProcessing}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Escalate Selected ({selectedProperties.size})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Districts</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Surat">Surat</option>
              <option value="Rajkot">Rajkot</option>
              <option value="Bhavnagar">Bhavnagar</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="ULPIN, Owner, Survey No..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: 'all', priority: 'all', district: 'all', search: '' })}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Batch Operations Progress */}
      {batchOperations.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Batch Operations</h3>
          <div className="space-y-3">
            {batchOperations.map(operation => (
              <div key={operation.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">
                      {operation.type.charAt(0).toUpperCase() + operation.type.slice(1)} 
                      ({operation.properties.length} properties)
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      by {operation.createdBy}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    operation.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    operation.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {operation.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${operation.progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {operation.progress}% complete
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Properties Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedProperties.size === filteredProperties.length && filteredProperties.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Select All ({filteredProperties.length})
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ULPIN ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area (sq m)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProperties.has(property.id)}
                      onChange={() => handlePropertySelect(property.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{property.ulpinId}</div>
                    <div className="text-sm text-gray-500">Survey: {property.surveyNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{property.ownerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.village}</div>
                    <div className="text-sm text-gray-500">{property.taluka}, {property.district}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.area.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(property.priority)}`}>
                      {property.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {property.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property.submittedDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">View</button>
                      {canApprove && property.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-900">Approve</button>
                      )}
                      {canReject && property.status === 'pending' && (
                        <button className="text-red-600 hover:text-red-900">Reject</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
        </div>
      )}
    </div>
  );
}; 