// Satellite utility functions for Gujarat LandChain

declare global {
  interface Window {
    viewSatellite: (propertyId: string, coordinates?: [number, number]) => void;
  }
}

// Mock satellite data for demo
const mockSatelliteData = {
  '1': {
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    coordinates: [23.2156, 72.6369],
    resolution: '10m',
    date: '2024-12-15',
    cloudCover: '5%'
  },
  '2': {
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
    coordinates: [23.0225, 72.5714],
    resolution: '10m',
    date: '2024-12-10',
    cloudCover: '12%'
  },
  '3': {
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    coordinates: [22.3072, 73.1812],
    resolution: '10m',
    date: '2024-12-12',
    cloudCover: '8%'
  },
  '4': {
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    coordinates: [23.1685, 72.6503],
    resolution: '10m',
    date: '2024-12-14',
    cloudCover: '3%'
  }
};

// Initialize satellite functions
export function initializeSatellite() {
  if (typeof window !== 'undefined') {
    window.viewSatellite = (propertyId: string, coordinates?: [number, number]) => {
      console.log(`Viewing satellite imagery for property ${propertyId}`);
      
      const satelliteData = mockSatelliteData[propertyId as keyof typeof mockSatelliteData];
      
      if (satelliteData) {
        // Create modal or open satellite view
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
          <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Satellite Imagery - Property ${propertyId}</h3>
              <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <img src="${satelliteData.imageUrl}" alt="Satellite imagery" class="w-full h-96 object-cover rounded-lg">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="font-medium">Coordinates:</span>
                  <p>${satelliteData.coordinates[0]}, ${satelliteData.coordinates[1]}</p>
                </div>
                <div>
                  <span class="font-medium">Resolution:</span>
                  <p>${satelliteData.resolution}</p>
                </div>
                <div>
                  <span class="font-medium">Date:</span>
                  <p>${satelliteData.date}</p>
                </div>
                <div>
                  <span class="font-medium">Cloud Cover:</span>
                  <p>${satelliteData.cloudCover}</p>
                </div>
              </div>
            </div>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.remove();
          }
        });
      } else {
        alert(`Satellite data not available for property ${propertyId}`);
      }
    };
  }
}

// Export for use in components
export { mockSatelliteData }; 