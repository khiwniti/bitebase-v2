import { useEffect, useRef, useState, useCallback } from 'react';
import { MapState, MapAction } from '@/types';
import { MapControls, MapInsights, MapLegend } from '@/components/ui/map-controls';
import { generateHeatmapData, generateCompetitorMarkers, DEFAULT_MAP_STATE } from '@/lib/mapUtils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Target, Users, BarChart3, Building, TrendingUp, Zap } from 'lucide-react';

interface MapCanvasProps {
  sessionId: string | null;
  mapState: MapState;
  onMapUpdate: (newState: MapState) => void;
  onLocationUpdate?: (location: { lat: number; lng: number; address: string }) => void;
  className?: string;
  agentInsights?: Array<{
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
}

// Enhanced map layer types for agent-driven visualization
const ENHANCED_LAYER_TYPES = {
  demographics: { icon: Users, color: 'bg-blue-500', label: 'Demographics' },
  competitors: { icon: Target, color: 'bg-red-500', label: 'Competitors' },
  traffic: { icon: BarChart3, color: 'bg-green-500', label: 'Foot Traffic' },
  sites: { icon: Building, color: 'bg-purple-500', label: 'Recommended Sites' },
  zoning: { icon: MapPin, color: 'bg-orange-500', label: 'Zoning Info' },
  opportunities: { icon: TrendingUp, color: 'bg-yellow-500', label: 'Opportunities' },
} as const;

export function MapCanvas({ sessionId, mapState, onMapUpdate, className = "", agentInsights = [] }: MapCanvasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [insights, setInsights] = useState<Array<{
    title: string;
    description: string;
    type: 'opportunity' | 'risk' | 'info';
  }>>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedLayers, setGeneratedLayers] = useState<any[]>([]);

  const { sendMapUpdate, lastMessage } = useWebSocket(sessionId);

  // CopilotKit actions for map interaction
  useCopilotAction({
    name: "updateMapLayers",
    description: "Update map layer visibility and data based on agent analysis",
    parameters: [
      { name: "layers", type: "object[]", description: "Array of layer configurations" },
    ],
    handler: async ({ layers }) => {
      setGeneratedLayers(layers);
      const newState = {
        ...mapState,
        layers: mapState.layers.map(layer => {
          const update = layers.find((l: any) => l.id === layer.id);
          return update ? { ...layer, ...update } : layer;
        })
      };
      onMapUpdate(newState);
      return "Map layers updated successfully";
    },
  });

  useCopilotAction({
    name: "highlightMapLocation",
    description: "Highlight a specific location on the map with analysis data",
    parameters: [
      { name: "lat", type: "number", description: "Latitude" },
      { name: "lng", type: "number", description: "Longitude" },
      { name: "address", type: "string", description: "Address" },
      { name: "analysisData", type: "object", description: "Analysis data to display" },
    ],
    handler: async ({ lat, lng, address, analysisData }) => {
      setSelectedLocation({ lat, lng, address });
      setInsights(prev => [...prev, {
        title: `Analysis: ${address}`,
        description: (analysisData as any)?.summary || "Location analysis complete",
        type: 'info'
      }]);
      return `Location ${address} highlighted with analysis data`;
    },
  });

  // Make map state readable by agents
  useCopilotReadable({
    description: "Current map state and selected location",
    value: { mapState, selectedLocation, insights, generatedLayers }
  });

  // Handle layer toggle with agent integration
  const handleLayerToggle = useCallback((layerId: string) => {
    const newState = {
      ...mapState,
      layers: mapState.layers.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    };
    onMapUpdate(newState);

    // Send WebSocket update
    sendMapUpdate('layer_toggle', { layerId, visible: !mapState.layers.find(l => l.id === layerId)?.visible });

    // Trigger agent analysis if relevant layer is activated
    if (newState.layers.find(l => l.id === layerId)?.visible) {
      triggerAgentAnalysisForLayer(layerId);
    }
  }, [mapState, onMapUpdate, sendMapUpdate, triggerAgentAnalysisForLayer]);

  // Trigger agent analysis based on layer type
  const triggerAgentAnalysisForLayer = useCallback((layerId: string) => {
    setIsAnalyzing(true);

    // Simulate agent analysis with realistic delay
    setTimeout(() => {
      const analysisResults = generateLayerAnalysis(layerId);
      setInsights(prev => [...prev, ...analysisResults]);
      setIsAnalyzing(false);
    }, 2000);
  }, []);

  // Generate realistic analysis results for different layers
  const generateLayerAnalysis = (layerId: string) => {
    const analyses = {
      demographics: [
        {
          title: "High-Income Demographics Detected",
          description: "Area shows 65% households with $75K+ income, ideal for upscale dining",
          type: 'opportunity' as const
        }
      ],
      competitors: [
        {
          title: "Competitive Gap Identified",
          description: "No Italian restaurants within 0.5 miles - market opportunity",
          type: 'opportunity' as const
        }
      ],
      traffic: [
        {
          title: "Peak Traffic Analysis",
          description: "Lunch traffic 40% higher than dinner - consider lunch-focused concept",
          type: 'info' as const
        }
      ],
      sites: [
        {
          title: "Prime Location Identified",
          description: "Corner location with high visibility and parking availability",
          type: 'opportunity' as const
        }
      ]
    };

    return analyses[layerId as keyof typeof analyses] || [];
  };

  // Handle map click for location selection
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert click coordinates to lat/lng (simplified)
    const lat = 37.7749 + (y - rect.height / 2) * 0.001;
    const lng = -122.4194 + (x - rect.width / 2) * 0.001;
    const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    setSelectedLocation({ lat, lng, address });

    // Trigger location analysis
    setIsAnalyzing(true);
    setTimeout(() => {
      setInsights(prev => [...prev, {
        title: "Location Selected",
        description: `Analyzing market potential for ${address}`,
        type: 'info'
      }]);
      setIsAnalyzing(false);
    }, 1500);
  };

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'map_update' && lastMessage.sessionId === sessionId) {
      const { action, data } = lastMessage;
      
      switch (action) {
        case 'layer_toggle':
          handleLayerToggle(data.layerId);
          break;
        case 'location_analysis':
          // Add insights based on analysis
          setInsights(prev => [
            ...prev,
            {
              title: data.location,
              description: `Analysis complete: ${data.summary}`,
              type: 'info'
            }
          ]);
          break;
        case 'marker_add':
          // Handle new markers
          console.log('Adding marker:', data);
          break;
      }
    }
  }, [lastMessage, sessionId, handleLayerToggle]);

  // Initialize mock insights
  useEffect(() => {
    const mockInsights = [
      {
        title: "Mission District",
        description: "47% higher foot traffic than average. Low cafe density.",
        type: 'opportunity' as const
      },
      {
        title: "SOMA Area", 
        description: "Growing tech workforce. High lunch demand.",
        type: 'opportunity' as const
      },
      {
        title: "High Rent Zone",
        description: "Rent prices 35% above city average.",
        type: 'risk' as const
      }
    ];
    setInsights(mockInsights);
  }, []);

  return (
    <div className={`relative h-full ${className}`} data-testid="map-canvas">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="h-full w-full bg-muted/20 relative overflow-hidden"
        data-testid="map-container"
      >
        {/* Enhanced Interactive Map */}
        <div
          className="h-full w-full bg-cover bg-center relative cursor-crosshair"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={handleMapClick}
        >
          {/* Enhanced Agent-Driven Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {mapState.layers.filter(layer => layer.visible).map(layer => (
              <div key={layer.id} data-testid={`layer-${layer.id}`}>
                {/* Demographics Heatmap */}
                {layer.id === 'demographics' && (
                  <>
                    <div className="absolute top-1/4 left-1/3 w-32 h-24 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
                    <div className="absolute top-1/2 right-1/4 w-24 h-20 bg-blue-600/40 rounded-full blur-lg" />
                    <div className="absolute bottom-1/3 left-1/4 w-28 h-22 bg-blue-400/35 rounded-full blur-xl" />
                  </>
                )}

                {/* Traffic Patterns */}
                {layer.id === 'traffic' && (
                  <>
                    <div className="absolute top-1/4 left-1/3 w-32 h-24 bg-green-500/30 rounded-full blur-xl" />
                    <div className="absolute top-1/2 right-1/4 w-24 h-20 bg-green-600/40 rounded-full blur-lg" />
                    <div className="absolute bottom-1/3 left-1/4 w-28 h-22 bg-green-400/35 rounded-full blur-xl" />
                  </>
                )}

                {/* Competitor Density */}
                {layer.id === 'competitors' && (
                  <>
                    <div className="absolute top-1/3 right-1/3 w-20 h-16 bg-red-500/25 rounded-full blur-lg" />
                    <div className="absolute bottom-1/4 left-1/2 w-24 h-18 bg-red-600/30 rounded-full blur-xl" />
                  </>
                )}

                {/* Opportunity Zones */}
                {layer.id === 'opportunities' && (
                  <>
                    <div className="absolute top-1/5 right-1/5 w-16 h-16 bg-yellow-500/40 rounded-full blur-md animate-pulse" />
                    <div className="absolute bottom-1/5 left-1/5 w-20 h-20 bg-yellow-400/35 rounded-full blur-lg animate-pulse" />
                  </>
                )}
              </div>
            ))}

            {/* Enhanced Location Markers */}
            {mapState.layers.find(layer => layer.id === 'competitors')?.visible && (
              <>
                <div
                  className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto group"
                  data-testid="marker-competitor-1"
                >
                  <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target size={12} className="text-white" />
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Bella Vista Italian - 4.2★
                  </div>
                </div>
                <div
                  className="absolute top-2/3 right-1/3 transform translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto group"
                  data-testid="marker-competitor-2"
                >
                  <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target size={12} className="text-white" />
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Corner Cafe - 3.8★
                  </div>
                </div>
                <div
                  className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto group"
                  data-testid="marker-opportunity"
                >
                  <div className="w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform animate-pulse">
                    <TrendingUp size={12} className="text-white" />
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Prime Opportunity Site
                  </div>
                </div>
              </>
            )}

            {/* Selected Location Indicator */}
            {selectedLocation && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-bounce">
                  <MapPin size={16} className="text-white" />
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                  <div className="font-semibold">Selected Location</div>
                  <div className="text-xs opacity-90">{selectedLocation.address}</div>
                </div>
              </div>
            )}

            {/* Agent Analysis Indicators */}
            {isAnalyzing && (
              <div className="absolute top-4 right-4 pointer-events-none">
                <div className="bg-primary/90 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
                  <Zap size={16} className="animate-pulse" />
                  <span className="text-sm font-medium">AI Agents Analyzing...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <MapControls
        layers={mapState.layers}
        onLayerToggle={handleLayerToggle}
        className="absolute top-4 left-4"
      />

      {/* AI Insights Panel */}
      <MapInsights
        insights={insights}
        className="absolute bottom-4 right-4"
      />

      {/* Map Legend */}
      <MapLegend
        layers={mapState.layers}
        className="absolute bottom-4 left-4"
      />

      {/* Loading Overlay */}
      {mapState.activeAnalysis && (
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center"
          data-testid="map-loading"
        >
          <div className="bitebase-glass-panel text-center">
            <div className="bitebase-spinner mx-auto mb-4" />
            <p className="text-sm font-medium">Analyzing {mapState.activeAnalysis}...</p>
          </div>
        </div>
      )}
    </div>
  );
}
