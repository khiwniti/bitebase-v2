'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/queryClient'
import ErrorBoundary from '@/components/ErrorBoundary'
import { CopilotKit } from '@copilotkit/react-core'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        forcedTheme="light"
      >
        <QueryClientProvider client={queryClient}>
          <CopilotKit 
            runtimeUrl="/api/copilotkit"
            publicLicenseKey="ck_pub_4bae12d076311a78139ec12d2215c973"
          >
            <TooltipProvider>
              {children}
              <Toaster />
              <ReactQueryDevtools initialIsOpen={false} />
            </TooltipProvider>
          </CopilotKit>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}