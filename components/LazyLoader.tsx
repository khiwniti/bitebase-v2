import React, { Suspense, lazy, ComponentType, useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useIntersectionObserver } from '@/lib/performance';
import ErrorBoundary from './ErrorBoundary';

// Loading skeleton components
export const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`space-y-4 ${className}`}>
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-32 w-full" />
  </div>
);

export const CardSkeleton = ({ className = '' }: { className?: string }) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const MapSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-muted/30 rounded-lg flex items-center justify-center ${className}`}>
    <div className="text-center">
      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
      <div className="text-sm text-muted-foreground">Loading map...</div>
    </div>
  </div>
);

export const ChatSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`space-y-4 ${className}`}>
    {[1, 2, 3].map((i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs p-3 rounded-lg ${
          i % 2 === 0 ? 'bg-primary/10' : 'bg-muted/50'
        }`}>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

// Enhanced loading component with retry functionality
interface LoadingFallbackProps {
  error?: Error;
  retry?: () => void;
  type?: 'default' | 'card' | 'map' | 'chat';
  className?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  error, 
  retry, 
  type = 'default',
  className = '' 
}) => {
  if (error) {
    return (
      <Card className={`border-destructive/20 ${className}`}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="font-semibold text-destructive mb-2">Failed to load component</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          {retry && (
            <Button onClick={retry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const skeletonComponents = {
    default: LoadingSkeleton,
    card: CardSkeleton,
    map: MapSkeleton,
    chat: ChatSkeleton
  };

  const SkeletonComponent = skeletonComponents[type];

  return (
    <div className={`animate-pulse ${className}`}>
      <SkeletonComponent />
    </div>
  );
};

// Intersection-based lazy loader
interface IntersectionLazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export const IntersectionLazyLoader: React.FC<IntersectionLazyLoaderProps> = ({
  children,
  fallback = <LoadingSkeleton />,
  rootMargin = '50px',
  threshold = 0.1,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(ref, { rootMargin, threshold });
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  return (
    <div ref={ref} className={className}>
      {hasLoaded ? children : fallback}
    </div>
  );
};

// Progressive image loader
interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  placeholder,
  className = '',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    img.src = src;
  }, [src, onLoad, onError]);

  if (hasError) {
    return (
      <div className={`bg-muted/30 flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm">Failed to load image</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
        />
      )}
      {!isLoaded && !placeholder && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

// Lazy component wrapper with error boundary
interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  retryable?: boolean;
  [key: string]: any;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  loader,
  fallback = <LoadingFallback />,
  errorFallback,
  retryable = true,
  ...props
}) => {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadComponent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const module = await loader();
      setComponent(() => module.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    return (
      <LoadingFallback 
        error={error} 
        retry={retryable ? loadComponent : undefined}
      />
    );
  }

  if (isLoading || !Component) {
    return <>{fallback}</>;
  }

  return (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Preloader for critical components
export const preloadComponent = (loader: () => Promise<{ default: ComponentType<any> }>) => {
  return loader();
};

// Lazy route component
export const createLazyRoute = (
  loader: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) => {
  const LazyRouteComponent = lazy(loader);
  
  return (props: any) => (
    <ErrorBoundary>
      <Suspense fallback={fallback || <LoadingFallback />}>
        <LazyRouteComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Bundle splitting utilities for App Router
export const LazyPages = {
  Landing: createLazyRoute(() => import('@/app/landing/page')),
  Chat: createLazyRoute(() => import('@/app/chat/page')),
  Report: createLazyRoute(() => import('@/app/report/[reportId]/page')),
  Settings: createLazyRoute(() => import('@/app/settings/page')),
  Features: createLazyRoute(() => import('@/app/features/page')),
  Pricing: createLazyRoute(() => import('@/app/pricing/page')),
  Analytics: createLazyRoute(() => import('@/app/analytics/page')),
  EnhancedDashboard: createLazyRoute(() => import('@/app/dashboard/page')),
};

// Performance monitoring for lazy loading
export const withLoadingMetrics = <P extends object>(
  Component: ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const [startTime] = useState(() => performance.now());

    useEffect(() => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Report to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // Example: analytics.track('component_load_time', { component: componentName, duration: loadTime });
      }
    }, [startTime]);

    return <Component {...props} />;
  };
};

export default LazyComponent;
