'use client'

// GL-0803: Property Transfer Workflow Implementation
// Sprint 8: Citizen PWA Development
// Gujarat LandChain × Transfer Interface

/*
Property Transfer Workflow Interface
- Objective: Multi-step property transfer process with validation and blockchain integration
- Features: Step-by-step wizard, document upload, verification, blockchain transaction
- Integration: Aadhaar authentication, JuliaOS wallet, evidence validation
*/

import React, { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';

// Types and Interfaces
interface TransferStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  component: React.ReactNode;
}

interface PropertyDetails {
  ulpin: string;
  title: string;
  location: string;
  area: string;
  currentOwner: string;
  propertyType: 'residential' | 'commercial' | 'agricultural';
  verificationStatus: 'verified' | 'pending' | 'disputed';
  nftMint?: string;
  lastVerified: string;
}

interface TransferForm {
  propertyUlpin: string;
  sellerAadhaar: string;
  buyerAadhaar: string;
  buyerName: string;
  buyerAddress: string;
  transferReason: 'sale' | 'gift' | 'inheritance' | 'partition';
  saleAmount?: string;
  documents: File[];
  termsAccepted: boolean;
}

const PropertyTransferWorkflow: React.FC = () => {
  const { currentSession, hasPermission } = useSession();
  const { publicKey, connected } = useWallet();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [transferForm, setTransferForm] = useState<TransferForm>({
    propertyUlpin: '',
    sellerAadhaar: '',
    buyerAadhaar: '',
    buyerName: '',
    buyerAddress: '',
    transferReason: 'sale',
    saleAmount: '',
    documents: [],
    termsAccepted: false
  });
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transferStatus, setTransferStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock property data
  const mockProperties: PropertyDetails[] = [
    {
      ulpin: 'GJ24AB1234567890',
      title: 'Residential Plot - Sector 15',
      location: 'Gandhinagar, Gujarat',
      area: '2,400 sq ft',
      currentOwner: 'Rajesh Patel',
      propertyType: 'residential',
      verificationStatus: 'verified',
      nftMint: 'ULPinTreasury111111111111111111111111111111',
      lastVerified: '2024-12-15'
    },
    {
      ulpin: 'GJ24CD9876543210',
      title: 'Commercial Building',
      location: 'Ahmedabad, Gujarat',
      area: '8,500 sq ft',
      currentOwner: 'Suresh Mehta',
      propertyType: 'commercial',
      verificationStatus: 'verified',
      nftMint: 'ULPinTreasury111111111111111111111111111112',
      lastVerified: '2024-12-10'
    }
  ];

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Property Selection
        if (!transferForm.propertyUlpin) {
          newErrors.propertyUlpin = 'Please select a property';
        }
        break;
      
      case 2: // Party Details
        if (!transferForm.sellerAadhaar || transferForm.sellerAadhaar.length !== 12) {
          newErrors.sellerAadhaar = 'Please enter a valid 12-digit Aadhaar number';
        }
        if (!transferForm.buyerAadhaar || transferForm.buyerAadhaar.length !== 12) {
          newErrors.buyerAadhaar = 'Please enter a valid 12-digit Aadhaar number';
        }
        if (!transferForm.buyerName.trim()) {
          newErrors.buyerName = 'Please enter buyer name';
        }
        if (!transferForm.buyerAddress.trim()) {
          newErrors.buyerAddress = 'Please enter buyer address';
        }
        break;
      
      case 3: // Transfer Details
        if (transferForm.transferReason === 'sale' && !transferForm.saleAmount) {
          newErrors.saleAmount = 'Please enter sale amount';
        }
        break;
      
      case 4: // Document Upload
        if (transferForm.documents.length === 0) {
          newErrors.documents = 'Please upload required documents';
        }
        break;
      
      case 5: // Review & Confirm
        if (!transferForm.termsAccepted) {
          newErrors.termsAccepted = 'Please accept the terms and conditions';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Form handlers
  const handleInputChange = (field: keyof TransferForm, value: any) => {
    setTransferForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setTransferForm(prev => ({ ...prev, documents: [...prev.documents, ...fileArray] }));
    }
  };

  const removeDocument = (index: number) => {
    setTransferForm(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Property selection
  const handlePropertySelect = (ulpin: string) => {
    const property = mockProperties.find(p => p.ulpin === ulpin);
    setSelectedProperty(property || null);
    handleInputChange('propertyUlpin', ulpin);
  };

  // Transfer submission
  const submitTransfer = async () => {
    if (!validateStep(5)) return;

    setIsLoading(true);
    setTransferStatus('processing');

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock successful transfer
      setTransferStatus('success');
      setCurrentStep(6);
    } catch (error) {
      console.error('Transfer failed:', error);
      setTransferStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step components
  const Step1PropertySelection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Property for Transfer</h3>
        <p className="text-gray-600">Choose the property you want to transfer from your portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockProperties.map(property => (
          <div
            key={property.ulpin}
            onClick={() => handlePropertySelect(property.ulpin)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedProperty?.ulpin === property.ulpin
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{property.title}</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                property.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                property.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {property.verificationStatus}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{property.location}</p>
            <div className="text-sm text-gray-500 space-y-1">
              <div>ULPIN: {property.ulpin}</div>
              <div>Area: {property.area}</div>
              <div>Type: {property.propertyType}</div>
            </div>
          </div>
        ))}
      </div>

      {errors.propertyUlpin && (
        <p className="text-red-600 text-sm">{errors.propertyUlpin}</p>
      )}
    </div>
  );

  const Step2PartyDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Party Information</h3>
        <p className="text-gray-600">Enter details for both seller and buyer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seller Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Seller Information</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhaar Number *
            </label>
            <input
              type="text"
              value={transferForm.sellerAadhaar}
              onChange={(e) => handleInputChange('sellerAadhaar', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.sellerAadhaar ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12-digit Aadhaar number"
              maxLength={12}
            />
            {errors.sellerAadhaar && (
              <p className="text-red-600 text-sm mt-1">{errors.sellerAadhaar}</p>
            )}
          </div>
        </div>

        {/* Buyer Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Buyer Information</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhaar Number *
            </label>
            <input
              type="text"
              value={transferForm.buyerAadhaar}
              onChange={(e) => handleInputChange('buyerAadhaar', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.buyerAadhaar ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12-digit Aadhaar number"
              maxLength={12}
            />
            {errors.buyerAadhaar && (
              <p className="text-red-600 text-sm mt-1">{errors.buyerAadhaar}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={transferForm.buyerName}
              onChange={(e) => handleInputChange('buyerName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.buyerName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.buyerName && (
              <p className="text-red-600 text-sm mt-1">{errors.buyerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              value={transferForm.buyerAddress}
              onChange={(e) => handleInputChange('buyerAddress', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.buyerAddress ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter complete address"
              rows={3}
            />
            {errors.buyerAddress && (
              <p className="text-red-600 text-sm mt-1">{errors.buyerAddress}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const Step3TransferDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Transfer Details</h3>
        <p className="text-gray-600">Specify the reason and details for the transfer</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transfer Reason *
          </label>
          <select
            value={transferForm.transferReason}
            onChange={(e) => handleInputChange('transferReason', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="sale">Sale</option>
            <option value="gift">Gift</option>
            <option value="inheritance">Inheritance</option>
            <option value="partition">Partition</option>
          </select>
        </div>

        {transferForm.transferReason === 'sale' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Amount (₹) *
            </label>
            <input
              type="text"
              value={transferForm.saleAmount}
              onChange={(e) => handleInputChange('saleAmount', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.saleAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter sale amount"
            />
            {errors.saleAmount && (
              <p className="text-red-600 text-sm mt-1">{errors.saleAmount}</p>
            )}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Transfer Summary</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>Property: {selectedProperty?.title}</div>
            <div>ULPIN: {selectedProperty?.ulpin}</div>
            <div>Current Owner: {selectedProperty?.currentOwner}</div>
            <div>New Owner: {transferForm.buyerName}</div>
            {transferForm.transferReason === 'sale' && transferForm.saleAmount && (
              <div>Sale Amount: ₹{transferForm.saleAmount}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const Step4DocumentUpload = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Document Upload</h3>
        <p className="text-gray-600">Upload required documents for the transfer</p>
      </div>

      <div className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Required Documents</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Sale Deed / Transfer Agreement</li>
            <li>• Identity Proof (Aadhaar Card)</li>
            <li>• Address Proof</li>
            <li>• Property Tax Receipt</li>
            <li>• NOC from Society/Authority (if applicable)</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Documents *
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => handleDocumentUpload(e.target.files)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {errors.documents && (
            <p className="text-red-600 text-sm mt-1">{errors.documents}</p>
          )}
        </div>

        {transferForm.documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
            {transferForm.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const Step5ReviewConfirm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review & Confirm</h3>
        <p className="text-gray-600">Please review all details before proceeding with the transfer</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Transfer Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Property Details</div>
              <div className="text-gray-600 mt-1">
                <div>{selectedProperty?.title}</div>
                <div>ULPIN: {selectedProperty?.ulpin}</div>
                <div>Location: {selectedProperty?.location}</div>
                <div>Area: {selectedProperty?.area}</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Transfer Details</div>
              <div className="text-gray-600 mt-1">
                <div>Reason: {transferForm.transferReason}</div>
                <div>Seller: {transferForm.sellerAadhaar}</div>
                <div>Buyer: {transferForm.buyerName}</div>
                {transferForm.saleAmount && (
                  <div>Amount: ₹{transferForm.saleAmount}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Blockchain Transaction</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>• Property NFT will be transferred to new owner</div>
            <div>• Transaction will be recorded on Solana blockchain</div>
            <div>• Transfer will be irreversible once confirmed</div>
            <div>• Gas fees will be deducted from your wallet</div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={transferForm.termsAccepted}
            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I confirm that all information provided is accurate and I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              terms and conditions
            </Link>{' '}
            of the property transfer.
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="text-red-600 text-sm">{errors.termsAccepted}</p>
        )}
      </div>
    </div>
  );

  const Step6Success = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h3>
        <p className="text-gray-600">
          Your property transfer has been completed and recorded on the blockchain.
        </p>
      </div>

      <div className="bg-green-50 p-4 rounded-lg max-w-md mx-auto">
        <h4 className="font-medium text-green-900 mb-2">Transaction Details</h4>
        <div className="text-sm text-green-800 space-y-1">
          <div>Transaction Hash: 0x1234...5678</div>
          <div>Block Number: 12345678</div>
          <div>Gas Used: 0.001 SOL</div>
          <div>Status: Confirmed</div>
        </div>
      </div>

      <div className="space-y-3">
        <button className="btn-primary">
          View Transaction on Explorer
        </button>
        <div>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );

  // Steps configuration
  const steps: TransferStep[] = [
    {
      id: 1,
      title: 'Select Property',
      description: 'Choose property to transfer',
      status: currentStep >= 1 ? 'current' : 'pending',
      component: <Step1PropertySelection />
    },
    {
      id: 2,
      title: 'Party Details',
      description: 'Enter seller and buyer info',
      status: currentStep >= 2 ? 'current' : 'pending',
      component: <Step2PartyDetails />
    },
    {
      id: 3,
      title: 'Transfer Details',
      description: 'Specify transfer reason',
      status: currentStep >= 3 ? 'current' : 'pending',
      component: <Step3TransferDetails />
    },
    {
      id: 4,
      title: 'Documents',
      description: 'Upload required documents',
      status: currentStep >= 4 ? 'current' : 'pending',
      component: <Step4DocumentUpload />
    },
    {
      id: 5,
      title: 'Review',
      description: 'Confirm transfer details',
      status: currentStep >= 5 ? 'current' : 'pending',
      component: <Step5ReviewConfirm />
    },
    {
      id: 6,
      title: 'Complete',
      description: 'Transfer successful',
      status: currentStep === 6 ? 'completed' : 'pending',
      component: <Step6Success />
    }
  ];

  // Check permissions
  if (!hasPermission('property_transfer')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to perform property transfers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Property Transfer</h1>
              <p className="text-gray-600 mt-1">Transfer property ownership securely on blockchain</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Wallet: {connected ? `${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}` : 'Not connected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        {currentStep < 6 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.slice(0, 5).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                    step.status === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {step.status === 'completed' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  {index < 4 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {steps.slice(0, 5).map(step => (
                <div key={step.id} className="text-center">
                  <div className="text-xs font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {steps[currentStep - 1].component}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 6 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              {currentStep === 5 ? (
                <button
                  onClick={submitTransfer}
                  disabled={isLoading || !transferForm.termsAccepted}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Submit Transfer'
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyTransferWorkflow;
