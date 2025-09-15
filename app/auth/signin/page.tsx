'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Brain, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: 'test@bitebase.app',
    password: 'test1234'
  });

  // Auto-fill demo credentials
  useEffect(() => {
    // Demo credentials are pre-filled for testing
    setCredentials({
      email: 'test@bitebase.app',
      password: 'test1234'
    });
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate authentication check
      if (credentials.email === 'test@bitebase.app' && credentials.password === 'test1234') {
        toast({
          title: "Success!",
          description: "Welcome to BiteBase Intelligence",
          variant: "default",
        });
        
        // Redirect to landing page
        router.push('/landing');
      } else {
        toast({
          title: "Invalid Credentials",
          description: "Please use the demo credentials: test@bitebase.app / test1234",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setCredentials({
      email: 'test@bitebase.app',
      password: 'test1234'
    });
    
    toast({
      title: "Demo Credentials Loaded",
      description: "Click Sign In to continue with demo account",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
          
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your BiteBase Intelligence account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Demo Account
                </span>
              </div>
            </div>
            
            <Button
              onClick={handleDemoLogin}
              variant="outline"
              className="w-full mt-4"
            >
              Use Demo Credentials
            </Button>
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Demo Credentials:</strong><br />
                Email: test@bitebase.app<br />
                Password: test1234
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}