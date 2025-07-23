'use client'

import { usePWA } from '@/hooks/usePWA'
import { useState, useEffect } from 'react'

export default function PWAStatus() {
  const { 
    isInstalled, 
    isInstallable, 
    isOnline, 
    showInstallPrompt, 
    updateAvailable, 
    updateApp 
  } = usePWA()
  
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)

  useEffect(() => {
    // Show install banner after 5 seconds if installable
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallBanner(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isInstallable, isInstalled])

  useEffect(() => {
    // Show update banner immediately if update is available
    if (updateAvailable) {
      setShowUpdateBanner(true)
    }
  }, [updateAvailable])

  const handleInstall = () => {
    showInstallPrompt()
    setShowInstallBanner(false)
  }

  const handleUpdate = () => {
    updateApp()
    setShowUpdateBanner(false)
  }

  const dismissInstall = () => {
    setShowInstallBanner(false)
  }

  const dismissUpdate = () => {
    setShowUpdateBanner(false)
  }

  return (
    <>
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">
                Install Gujarat LandChain
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Get quick access to the land registry on your home screen
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-blue-600 text-white text-xs px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={dismissInstall}
                  className="flex-1 bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={dismissInstall}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Update Banner */}
      {showUpdateBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-green-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">
                Update Available
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                A new version of Gujarat LandChain is ready to install
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-green-600 text-white text-xs px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Update Now
                </button>
                <button
                  onClick={dismissUpdate}
                  className="flex-1 bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={dismissUpdate}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Online/Offline Status */}
      {!isOnline && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-md text-sm z-50">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>You're offline - some features may be limited</span>
          </div>
        </div>
      )}

      {/* Installed Status */}
      {isInstalled && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-md text-sm z-50">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>App installed</span>
          </div>
        </div>
      )}
    </>
  )
} 