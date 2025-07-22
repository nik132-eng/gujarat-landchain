'use client'

import { useState } from 'react'

interface TransferStep {
  id: number
  title: string
  description: string
  completed: boolean
}

interface PropertyTransfer {
  propertyId: string
  propertyTitle: string
  currentOwner: string
  newOwner: string
  transferType: 'sale' | 'gift' | 'inheritance' | 'lease'
  amount?: string
  documents: File[]
  verificationStatus: 'pending' | 'verified' | 'rejected'
}

const transferSteps: TransferStep[] = [
  {
    id: 1,
    title: 'Property Selection',
    description: 'Select the property you want to transfer',
    completed: false
  },
  {
    id: 2,
    title: 'Transfer Details',
    description: 'Provide transfer type and recipient information',
    completed: false
  },
  {
    id: 3,
    title: 'Document Upload',
    description: 'Upload required legal documents',
    completed: false
  },
  {
    id: 4,
    title: 'Verification',
    description: 'AI verification and blockchain validation',
    completed: false
  },
  {
    id: 5,
    title: 'Payment & Completion',
    description: 'Complete transaction and transfer ownership',
    completed: false
  }
]

const mockProperties = [
  {
    id: '1',
    title: 'Residential Plot - Sector 15',
    location: 'Gandhinagar, Gujarat',
    area: '2,400 sq ft',
    value: '₹85,00,000'
  },
  {
    id: '2',
    title: 'Commercial Building',
    location: 'Ahmedabad, Gujarat',
    area: '8,500 sq ft',
    value: '₹3,20,00,000'
  },
  {
    id: '3',
    title: 'Agricultural Land',
    location: 'Vadodara, Gujarat',
    area: '12,000 sq ft',
    value: '₹48,00,000'
  }
]

export default function PropertyTransferWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [transfer, setTransfer] = useState<Partial<PropertyTransfer>>({
    transferType: 'sale',
    documents: [],
    verificationStatus: 'pending'
  })
  const [steps, setSteps] = useState(transferSteps)

  const updateStepCompletion = (stepId: number, completed: boolean) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, completed } : step
    ))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      updateStepCompletion(currentStep, true)
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setTransfer(prev => ({
        ...prev,
        documents: [...(prev.documents || []), ...fileArray]
      }))
    }
  }

  const removeDocument = (index: number) => {
    setTransfer(prev => ({
      ...prev,
      documents: prev.documents?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step.completed 
                  ? 'bg-gujarat-green-500 text-white' 
                  : currentStep === step.id 
                    ? 'bg-gujarat-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }
              `}>
                {step.completed ? '✓' : step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 w-16 mx-2 ${
                  step.completed ? 'bg-gujarat-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {steps[currentStep - 1]?.title}
          </h2>
          <p className="text-gray-600 mt-1">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Step 1: Property Selection */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Select Property to Transfer</h3>
            <div className="grid gap-4">
              {mockProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => setTransfer(prev => ({ ...prev, propertyId: property.id, propertyTitle: property.title }))}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    transfer.propertyId === property.id
                      ? 'border-gujarat-blue-500 bg-gujarat-blue-50'
                      : 'border-gray-200 hover:border-gujarat-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{property.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{property.location}</p>
                      <p className="text-gray-600 text-sm">Area: {property.area}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gujarat-blue-600">{property.value}</p>
                      <span className="text-xs text-gujarat-green-600 bg-gujarat-green-100 px-2 py-1 rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Transfer Details */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Transfer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Type
                </label>
                <select
                  value={transfer.transferType}
                  onChange={(e) => setTransfer(prev => ({ ...prev, transferType: e.target.value as any }))}
                  className="input-field"
                >
                  <option value="sale">Sale</option>
                  <option value="gift">Gift</option>
                  <option value="inheritance">Inheritance</option>
                  <option value="lease">Lease</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Owner Wallet Address
                </label>
                <input
                  type="text"
                  value={transfer.newOwner || ''}
                  onChange={(e) => setTransfer(prev => ({ ...prev, newOwner: e.target.value }))}
                  placeholder="Enter wallet address or search by name"
                  className="input-field"
                />
              </div>

              {transfer.transferType === 'sale' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Amount
                  </label>
                  <input
                    type="text"
                    value={transfer.amount || ''}
                    onChange={(e) => setTransfer(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="₹0.00"
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Owner
                </label>
                <input
                  type="text"
                  value="0x1234...5678 (You)"
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Document Upload */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Upload Required Documents</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Drop files here or click to upload
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, JPG, PNG up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              {transfer.documents && transfer.documents.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {transfer.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-900">{doc.name}</span>
                        </div>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents Checklist */}
              <div className="bg-gujarat-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gujarat-blue-900 mb-2">Required Documents:</h4>
                <ul className="text-sm text-gujarat-blue-800 space-y-1">
                  <li>• Property Title Deed</li>
                  <li>• Identity Proof of Both Parties</li>
                  <li>• {transfer.transferType === 'sale' ? 'Sale Agreement' : 'Transfer Agreement'}</li>
                  <li>• Property Tax Receipts</li>
                  <li>• No Objection Certificate (if applicable)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Verification */}
        {currentStep === 4 && (
          <div>
            <h3 className="text-lg font-medium mb-4">AI Verification & Blockchain Validation</h3>
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
                  <span className="text-yellow-800 font-medium">Verification in Progress...</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gujarat-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-900">Document Authentication</span>
                  </div>
                  <span className="text-gujarat-green-600 text-sm font-medium">Completed</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gujarat-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-900">Ownership Verification</span>
                  </div>
                  <span className="text-gujarat-green-600 text-sm font-medium">Completed</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-gray-900">Blockchain Validation</span>
                  </div>
                  <span className="text-yellow-600 text-sm font-medium">In Progress</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-gray-900">Legal Compliance Check</span>
                  </div>
                  <span className="text-gray-500 text-sm font-medium">Pending</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Payment & Completion */}
        {currentStep === 5 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Complete Transfer</h3>
            <div className="space-y-6">
              <div className="bg-gujarat-green-50 border border-gujarat-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gujarat-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gujarat-green-800 font-medium">All verifications completed successfully!</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Transfer Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property:</span>
                    <span className="text-gray-900">{transfer.propertyTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transfer Type:</span>
                    <span className="text-gray-900 capitalize">{transfer.transferType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="text-gray-900">{transfer.newOwner || 'Not specified'}</span>
                  </div>
                  {transfer.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-gray-900 font-medium">{transfer.amount}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Fee:</span>
                      <span className="text-gray-900">₹2,500</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">
                        {transfer.amount ? `₹${(parseInt(transfer.amount.replace(/[₹,]/g, '')) + 2500).toLocaleString()}` : '₹2,500'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full btn-primary py-3 text-lg">
                Complete Transfer & Pay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-6 py-2 rounded-lg ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Previous
        </button>
        
        <button
          onClick={nextStep}
          disabled={currentStep === steps.length}
          className={`px-6 py-2 rounded-lg ${
            currentStep === steps.length
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {currentStep === steps.length ? 'Completed' : 'Next'}
        </button>
      </div>
    </div>
  )
}
