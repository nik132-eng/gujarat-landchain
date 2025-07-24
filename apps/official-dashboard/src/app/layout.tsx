import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SolanaWalletProvider from '../components/SolanaWalletProvider'
import { JuliaOSProvider } from '../components/JuliaOSProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gujarat LandChain - Official Dashboard',
  description: 'Government administrative interface for Gujarat LandChain powered by JuliaOS and Solana',
  manifest: '/manifest.json',
  themeColor: '#1e40af',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaWalletProvider>
          <JuliaOSProvider>
            {children}
          </JuliaOSProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  )
} 