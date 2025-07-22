'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const navigation = [
  { name: 'Home', href: '/', icon: '🏠' },
  { name: 'Property Map', href: '/map', icon: '🗺️' },
  { name: 'My Properties', href: '/properties', icon: '📋' },
  { name: 'Transfers', href: '/transfers', icon: '🔄' },
  { name: 'Wallet', href: '/wallet', icon: '👛' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gujarat-blue-600 to-gujarat-saffron-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GL</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Gujarat LandChain</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
                    {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Link 
              href="/" 
              className="text-white hover:text-gujarat-saffron-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/map" 
              className="text-white hover:text-gujarat-saffron-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Property Map
            </Link>
            <Link 
              href="/transfers" 
              className="text-white hover:text-gujarat-saffron-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Transfers
            </Link>
            <Link 
              href="/wallet" 
              className="text-white hover:text-gujarat-saffron-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Wallet
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <WalletMultiButton className="!bg-gujarat-saffron-500 hover:!bg-gujarat-saffron-600 !rounded-lg !px-4 !py-2 !text-sm !font-medium !transition-colors" />
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-gujarat-blue-50 text-gujarat-blue-600'
                      : 'text-gray-600 hover:text-gujarat-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
            <div className="px-3 py-2">
              <WalletMultiButton className="!bg-gujarat-saffron-500 hover:!bg-gujarat-saffron-600 !rounded-lg !px-4 !py-2 !text-sm !font-medium !transition-colors !w-full" />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
