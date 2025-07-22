import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import SolanaWalletProvider from '@/components/SolanaWalletProvider'

export const metadata: Metadata = {
  title: 'Gujarat LandChain - Citizen Portal',
  description: 'Secure, transparent land registry powered by blockchain technology',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gujarat LandChain',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Gujarat LandChain',
    title: 'Gujarat LandChain - Citizen Portal',
    description: 'Secure, transparent land registry powered by blockchain technology',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1E40AF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <SolanaWalletProvider>
          <Navigation />
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  )
}
