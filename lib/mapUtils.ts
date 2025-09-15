import { MapLayer, MapState } from '@/types';

export const DEFAULT_MAP_STATE: MapState = {
  center: [37.7749, -122.4194], // San Francisco
  zoom: 12,
  layers: [
    { id: 'traffic', name: 'Foot Traffic Heatmap', type: 'heatmap', visible: true },
    { id: 'restaurants', name: 'Restaurant Density', type: 'heatmap', visible: true },
    { id: 'demographics', name: 'Demographics', type: 'overlay', visible: false },
    { id: 'rent', name: 'Rent Prices', type: 'overlay', visible: false },
    { id: 'zoning', name: 'Zoning Info', type: 'overlay', visible: false },
    { id: 'competitors', name: 'Competitors', type: 'markers', visible: false },
  ]
};

export function toggleMapLayer(mapState: MapState, layerId: string): MapState {
  return {
    ...mapState,
    layers: mapState.layers.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    )
  };
}

export function updateMapCenter(mapState: MapState, center: [number, number], zoom?: number): MapState {
  return {
    ...mapState,
    center,
    ...(zoom && { zoom })
  };
}

export function addMapLayer(mapState: MapState, layer: MapLayer): MapState {
  return {
    ...mapState,
    layers: [...mapState.layers, layer]
  };
}

export function removeMapLayer(mapState: MapState, layerId: string): MapState {
  return {
    ...mapState,
    layers: mapState.layers.filter(layer => layer.id !== layerId)
  };
}

export function updateLayerData(mapState: MapState, layerId: string, data: any): MapState {
  return {
    ...mapState,
    layers: mapState.layers.map(layer =>
      layer.id === layerId ? { ...layer, data } : layer
    )
  };
}

// Generate mock heatmap data for demo purposes
export function generateHeatmapData(type: 'traffic' | 'restaurants' | 'demographics'): Array<[number, number, number]> {
  const sfBounds = {
    north: 37.8324,
    south: 37.7072,
    east: -122.3482,
    west: -122.5270
  };

  const points: Array<[number, number, number]> = [];
  const numPoints = 50;

  for (let i = 0; i < numPoints; i++) {
    const lat = sfBounds.south + Math.random() * (sfBounds.north - sfBounds.south);
    const lng = sfBounds.west + Math.random() * (sfBounds.east - sfBounds.west);
    
    let intensity;
    switch (type) {
      case 'traffic':
        intensity = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
        break;
      case 'restaurants':
        intensity = Math.random() * 0.6 + 0.1; // 0.1 to 0.7
        break;
      case 'demographics':
        intensity = Math.random() * 0.9 + 0.1; // 0.1 to 1.0
        break;
      default:
        intensity = 0.5;
    }

    points.push([lat, lng, intensity]);
  }

  return points;
}

// Generate competitor markers
export function generateCompetitorMarkers(): Array<{
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: string;
  rating: number;
}> {
  const competitors = [
    { name: "Green Garden Café", type: "cafe", rating: 4.2 },
    { name: "Mission Burrito", type: "restaurant", rating: 4.5 },
    { name: "Techie Coffee", type: "cafe", rating: 4.0 },
    { name: "Fusion Kitchen", type: "restaurant", rating: 4.3 },
    { name: "Organic Bistro", type: "restaurant", rating: 4.7 },
  ];

  return competitors.map((comp, index) => ({
    id: `competitor-${index}`,
    lat: 37.7749 + (Math.random() - 0.5) * 0.1,
    lng: -122.4194 + (Math.random() - 0.5) * 0.1,
    ...comp
  }));
}

export function getLayerColor(layerId: string): string {
  const colors = {
    traffic: '#74C365',
    restaurants: '#E23D28',
    demographics: '#F4C431',
    rent: '#8B5CF6',
    zoning: '#06B6D4',
    competitors: '#EF4444'
  };
  return colors[layerId as keyof typeof colors] || '#64748B';
}

export function getLayerOpacity(layerId: string): number {
  const opacities = {
    traffic: 0.6,
    restaurants: 0.5,
    demographics: 0.4,
    rent: 0.5,
    zoning: 0.3,
    competitors: 1.0
  };
  return opacities[layerId as keyof typeof opacities] || 0.5;
}
