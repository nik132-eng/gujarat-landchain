import PropertyTransferWizard from '@/components/PropertyTransferWizard'

export default function TransfersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Property Transfer</h1>
              <p className="text-gray-600 mt-1">Transfer property ownership securely on the blockchain</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Average Processing Time:</span> 24-48 hours
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Wizard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Start Property Transfer
            </h2>
            <p className="text-gray-600">
              Follow the step-by-step process to transfer property ownership. All transfers are secured by blockchain technology and verified by AI.
            </p>
          </div>
          
          <PropertyTransferWizard />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gujarat-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-gujarat-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Secure & Immutable</h3>
            </div>
            <p className="text-gray-600 text-sm">
              All transfers are recorded on the blockchain, ensuring complete transparency and immutability of ownership records.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gujarat-saffron-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-gujarat-saffron-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">AI-Powered Verification</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Advanced AI algorithms verify documents and detect fraud, ensuring all transfers meet legal requirements automatically.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gujarat-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-gujarat-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Cost Effective</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Significantly lower fees compared to traditional property transfers, with transparent pricing and no hidden costs.
            </p>
          </div>
        </div>

        {/* Recent Transfers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transfer Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-gujarat-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Transfer Completed</div>
                  <div className="text-gray-600 text-xs">Residential Plot - Sector 15, Gandhinagar</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">₹85,00,000</div>
                <div className="text-xs text-gray-500">2 hours ago</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-gujarat-gold-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Transfer Pending</div>
                  <div className="text-gray-600 text-xs">Commercial Building, Ahmedabad</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">₹3,20,00,000</div>
                <div className="text-xs text-gray-500">1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
