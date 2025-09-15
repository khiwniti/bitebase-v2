import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MapLayer } from "@/types";
import { getLayerColor } from "@/lib/mapUtils";

interface MapControlsProps {
  layers: MapLayer[];
  onLayerToggle: (layerId: string) => void;
  className?: string;
}

export function MapControls({ layers, onLayerToggle, className = "" }: MapControlsProps) {
  return (
    <div className={`map-control-panel p-4 w-80 ${className}`} data-testid="map-controls">
      <h3 className="font-semibold mb-3 text-sm">Active Layers</h3>
      <div className="space-y-2">
        {layers.map((layer) => (
          <label 
            key={layer.id} 
            className="flex items-center space-x-2 text-sm cursor-pointer"
            data-testid={`layer-${layer.id}`}
          >
            <Checkbox
              checked={layer.visible}
              onCheckedChange={() => onLayerToggle(layer.id)}
              className="border-border text-primary focus:ring-primary"
              data-testid={`checkbox-${layer.id}`}
            />
            <span className="flex-1">{layer.name}</span>
            {layer.visible && (
              <Badge 
                variant="secondary"
                className="text-xs"
                style={{ 
                  backgroundColor: `${getLayerColor(layer.id)}20`,
                  color: getLayerColor(layer.id),
                  borderColor: `${getLayerColor(layer.id)}40`
                }}
                data-testid={`badge-${layer.id}`}
              >
                Active
              </Badge>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

interface MapInsightsProps {
  insights: Array<{
    title: string;
    description: string;
    type: 'opportunity' | 'risk' | 'info';
  }>;
  className?: string;
}

export function MapInsights({ insights, className = "" }: MapInsightsProps) {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-primary text-primary bg-primary/5';
      case 'risk': return 'border-destructive text-destructive bg-destructive/5';
      default: return 'border-muted-foreground text-muted-foreground bg-muted/5';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '💡';
      case 'risk': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`map-control-panel p-4 w-72 ${className}`} data-testid="map-insights">
      <h3 className="font-semibold mb-3 text-sm flex items-center">
        <span className="mr-2">🔍</span>
        AI Insights
      </h3>
      <div className="space-y-3">
        {insights.length === 0 ? (
          <div className="text-sm text-muted-foreground" data-testid="no-insights">
            No insights available yet. Start analyzing locations to see recommendations.
          </div>
        ) : (
          insights.map((insight, index) => (
            <div 
              key={index}
              className={`text-sm p-3 rounded border-l-2 ${getInsightColor(insight.type)}`}
              data-testid={`insight-${index}`}
            >
              <div className="font-medium flex items-center">
                <span className="mr-2">{getInsightIcon(insight.type)}</span>
                {insight.title}
              </div>
              <div className="text-xs mt-1 opacity-80">
                {insight.description}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface MapLegendProps {
  layers: MapLayer[];
  className?: string;
}

export function MapLegend({ layers, className = "" }: MapLegendProps) {
  const visibleLayers = layers.filter(layer => layer.visible);

  if (visibleLayers.length === 0) {
    return null;
  }

  return (
    <div className={`map-control-panel p-3 ${className}`} data-testid="map-legend">
      <h4 className="font-semibold text-xs mb-2">Legend</h4>
      <div className="space-y-1 text-xs">
        {visibleLayers.map((layer) => (
          <div 
            key={layer.id} 
            className="flex items-center space-x-2"
            data-testid={`legend-${layer.id}`}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getLayerColor(layer.id) }}
            />
            <span>{layer.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
