'use client'

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/landing');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground border-border">
        <CardHeader className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative rounded-xl bg-gradient-to-br from-primary via-blue-600 to-purple-600 p-2 shadow-lg w-12 h-12">
              <Brain className="w-full h-full text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent text-xl">
                BiteBase Intelligence
              </h1>
              <p className="text-muted-foreground font-medium -mt-1 text-sm">
                AI Market Research
              </p>
            </div>
          </div>
          
          <CardTitle className="text-6xl font-bold text-muted-foreground mb-2">404</CardTitle>
          <CardDescription className="text-lg">
            Page Not Found
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
            
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          <div className="mt-6 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Search className="w-4 h-4" />
              <span className="text-sm">Try searching or visit our landing page</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}