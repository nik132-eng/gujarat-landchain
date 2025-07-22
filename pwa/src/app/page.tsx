export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <header className="relative bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">GL</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gujarat LandChain</h1>
                <p className="text-sm text-gray-500">AI-Powered Land Registry</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-blue-600 hover:text-blue-700">
                Sign In
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to<br />
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Gujarat LandChain
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Revolutionary AI-powered land registry system for secure, transparent, and efficient property transfers in Gujarat, India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium">
                🔍 Search Properties
              </button>
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-lg font-medium">
                📱 Install PWA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600">Properties Registered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">₹500Cr+</div>
              <div className="text-gray-600">Total Value Secured</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Service Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cutting-Edge Features
            </h2>
            <p className="text-xl text-gray-600">
              Advanced technology meets traditional land registry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Verification</h3>
              <p className="text-gray-600">
                Advanced machine learning algorithms verify documents and detect fraud with 99.9% accuracy.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Blockchain Security</h3>
              <p className="text-gray-600">
                Immutable records stored on blockchain ensure permanent, tamper-proof property history.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Mobile-First Design</h3>
              <p className="text-gray-600">
                Progressive Web App works seamlessly across all devices with offline capabilities.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Interactive Maps</h3>
              <p className="text-gray-600">
                Satellite imagery and interactive maps for precise property visualization and boundaries.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Instant Transfers</h3>
              <p className="text-gray-600">
                Complete property transfers in minutes instead of months with automated workflows.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🏛️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Government Integration</h3>
              <p className="text-gray-600">
                Seamlessly integrated with Gujarat government systems for official recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to secure property transfers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-4">Property Search</h3>
              <p className="text-gray-600">
                Search for properties using ULPIN, address, or owner details with our advanced search system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-4">AI Verification</h3>
              <p className="text-gray-600">
                Our AI system verifies all documents and property details for authenticity and legal compliance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-4">Secure Transfer</h3>
              <p className="text-gray-600">
                Complete the transfer process with blockchain-secured transactions and digital signatures.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-4">Official Record</h3>
              <p className="text-gray-600">
                Receive official government recognition and immutable blockchain record of ownership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Revolutionize Property Transfers?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Gujarat citizens who have already secured their properties with blockchain technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium">
              Get Started Today
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-lg font-medium">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">GL</span>
                </div>
                <span className="text-xl font-bold">Gujarat LandChain</span>
              </div>
              <p className="text-gray-400">
                Securing Gujarat&apos;s future with AI-powered land registry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Property Search</li>
                <li>AI Verification</li>
                <li>Blockchain Security</li>
                <li>Mobile App</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Government</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Revenue Department</li>
                <li>Land Registry</li>
                <li>Digital Gujarat</li>
                <li>Official Portal</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Documentation</li>
                <li>System Status</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Government of Gujarat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
