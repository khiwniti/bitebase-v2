import { useEffect } from 'react';

/**
 * Preload critical routes and components to improve perceived performance
 */
export const useRoutePreloader = () => {
  useEffect(() => {
    const preloadRoutes = async () => {
      // Only preload in development or when user is likely to navigate
      if (typeof window === 'undefined') return;

      // Preload landing page components (most likely to be visited)
      const landingPreload = () => import('@/components/InstantLanding');
      
      // Preload chat interface after a short delay (second most likely)
      setTimeout(() => {
        import('@/components/MapCanvas');
      }, 1000);

      // Preload other critical components with low priority
      setTimeout(() => {
        import('@/components/MapCanvas');
      }, 2000);

      try {
        await landingPreload();
      } catch (error) {
        console.warn('Failed to preload landing page:', error);
      }
    };

    // Start preloading after initial render
    const timeoutId = setTimeout(preloadRoutes, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);
};

/**
 * Preload critical resources based on user interaction hints
 */
export const useIntelligentPreloader = () => {
  useEffect(() => {
    const preloadOnHover = (selector: string, importFn: () => Promise<any>) => {
      const elements = document.querySelectorAll(selector);
      
      const handleMouseEnter = () => {
        importFn().catch(console.warn);
      };

      elements.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter, { once: true });
      });

      return () => {
        elements.forEach(el => {
          el.removeEventListener('mouseenter', handleMouseEnter);
        });
      };
    };

    // Preload chat when user hovers over chat-related navigation
    const cleanupChat = preloadOnHover('[href*="chat"]', () => import('@/components/enhanced/EnhancedChatInterface'));
    
    // Preload dashboard when user hovers over dashboard links
    const cleanupDashboard = () => {}; // Placeholder - no dashboard component found

    return () => {
      cleanupChat();
      cleanupDashboard();
    };
  }, []);
};

/**
 * Resource hint injector for better loading performance
 */
export const injectResourceHints = () => {
  if (typeof document === 'undefined') return;

  const head = document.head;
  
  // DNS prefetch for external resources
  const dnsPrefetchDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
  ];

  dnsPrefetchDomains.forEach(domain => {
    if (!document.querySelector(`link[href*="${domain}"]`)) {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      head.appendChild(link);
    }
  });

  // Preconnect to critical domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
  ];

  preconnectDomains.forEach(domain => {
    if (!document.querySelector(`link[href="${domain}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      head.appendChild(link);
    }
  });
};

// Auto-inject resource hints on module load
if (typeof window !== 'undefined') {
  injectResourceHints();
}