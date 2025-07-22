import PropertyCard from '@/components/PropertyCard'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gujarat-blue-50 to-gujarat-saffron-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gujarat-blue-600 to-gujarat-blue-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
              Gujarat LandChain
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Secure, transparent land registry powered by blockchain technology. 
              Experience the future of property management with AI-driven automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary bg-gujarat-saffron-500 hover:bg-gujarat-saffron-600 px-8 py-3 text-lg">
                Search Properties
              </button>
              <Link href="/map" className="btn-secondary bg-white text-gujarat-blue-600 hover:bg-gray-50 px-8 py-3 text-lg inline-flex items-center justify-center">
                🗺️ View Interactive Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="card">
              <div className="text-3xl font-bold text-gujarat-blue-600 mb-2">2.5M+</div>
              <div className="text-gray-600">Properties Registered</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-gujarat-saffron-500 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-gujarat-green-500 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Explore verified properties in Gujarat's blockchain-powered land registry
            </p>
            <Link href="/map" className="btn-primary inline-flex items-center">
              🗺️ View All on Interactive Map
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PropertyCard
              title="Residential Plot - Sector 15"
              location="Gandhinagar, Gujarat"
              area="2,400"
              status="verified"
            />
            <PropertyCard
              title="Commercial Building"
              location="Ahmedabad, Gujarat"
              area="8,500"
              status="pending"
            />
            <PropertyCard
              title="Agricultural Land"
              location="Vadodara, Gujarat"
              area="12,000"
              status="verified"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Gujarat LandChain?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with cutting-edge technology to ensure security, transparency, and efficiency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-gujarat-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gujarat-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Blockchain Security</h3>
              <p className="text-gray-600">Immutable records ensure your property data is tamper-proof and secure</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-gujarat-saffron-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gujarat-saffron-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">AI-powered automation makes property transfers 10x faster</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-gujarat-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gujarat-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent Process</h3>
              <p className="text-gray-600">Every transaction is visible and verifiable on the blockchain</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gujarat-blue-600 to-gujarat-saffron-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of property owners who trust Gujarat LandChain for their land registry needs
          </p>
          <button className="btn-primary bg-white text-gujarat-blue-600 hover:bg-gray-50 px-8 py-3 text-lg">
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  )
}
