"use client";

import { useEffect } from 'react';
import { initializeSatellite } from '@/lib/satellite';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    // Initialize satellite functions
    initializeSatellite();
  }, []);

  return <>{children}</>;
} 