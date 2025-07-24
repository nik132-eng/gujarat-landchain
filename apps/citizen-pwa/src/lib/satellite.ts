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
        // Create modal with proper z-index and positioning
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
          <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style="z-index: 10000;">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Satellite Imagery - Property ${propertyId}</h3>
              <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <div class="relative">
                <img src="${satelliteData.imageUrl}" alt="Satellite imagery" class="w-full h-96 object-cover rounded-lg shadow-lg">
                <div class="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-md text-sm">
                  Property ${propertyId}
                </div>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <div>
                  <span class="font-medium text-gray-700">Coordinates:</span>
                  <p class="text-gray-900">${satelliteData.coordinates[0]}, ${satelliteData.coordinates[1]}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Resolution:</span>
                  <p class="text-gray-900">${satelliteData.resolution}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Date:</span>
                  <p class="text-gray-900">${satelliteData.date}</p>
                </div>
                <div>
                  <span class="font-medium text-gray-700">Cloud Cover:</span>
                  <p class="text-gray-900">${satelliteData.cloudCover}</p>
                </div>
              </div>
              <div class="flex justify-end space-x-3 pt-4 border-t">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  Close
                </button>
                <button onclick="window.open('${satelliteData.imageUrl}', '_blank')" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Open Full Size
                </button>
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

        // Close modal with Escape key
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
          }
        };
        document.addEventListener('keydown', handleEscape);
      } else {
        alert(`Satellite data not available for property ${propertyId}`);
      }
    };
  }
}

// Export for use in components
export { mockSatelliteData }; 