'use client'

import { Suspense } from 'react'
import MainNavigation from '@/components/navigation/MainNavigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WifiOff, Activity, Loader2 } from 'lucide-react'
import { useNetworkStatus, useMemoryMonitor } from '@/lib/performance'

// Network status indicator
function NetworkStatusIndicator() {
  const { isOnline, isSlowConnection } = useNetworkStatus();

  if (isOnline && !isSlowConnection) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="bg-background/95 backdrop-blur-sm border-destructive/20">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            {!isOnline ? (
              <>
                <WifiOff className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Offline</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">Slow Connection</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Memory usage indicator (development only)
function MemoryIndicator() {
  const { memoryUsage, isHighMemory } = useMemoryMonitor();

  if (process.env.NODE_ENV !== 'development' || !memoryUsage) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge className={`text-xs ${isHighMemory ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-secondary-foreground'}`}>
        Memory: {(memoryUsage * 100).toFixed(1)}%
      </Badge>
    </div>
  );
}

// Loading fallback component
function LoadingFallback({ className = "" }: { className?: string }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    </div>
  );
}

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NetworkStatusIndicator />
      <MemoryIndicator />
      <MainNavigation />
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </>
  )
}