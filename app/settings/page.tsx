'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { ArrowLeft, User, Bell, Shield, Key, Save, MapPin, BarChart3, Brain, Clock, Star, Download, Trash2, RefreshCw } from 'lucide-react';

interface UserPreferences {
  businessType: string;
  proactiveInsights: boolean;
  autoUpdateMapLayers: boolean;
  weeklyTrendNotifications: boolean;
  defaultLocation: string;
  analysisDepth: 'basic' | 'standard' | 'comprehensive';
  reportFormat: 'summary' | 'detailed' | 'executive';
  agentPersonality: 'professional' | 'friendly' | 'analytical';
  dataRetention: number; // days
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

interface SessionHistory {
  id: string;
  title: string;
  createdAt: string;
  lastActivity: string;
  status: string;
  messageCount: number;
  analysisCount: number;
  reportGenerated: boolean;
}

export default function Settings() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    businessType: 'restaurant'
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    businessType: 'restaurant',
    proactiveInsights: true,
    autoUpdateMapLayers: true,
    weeklyTrendNotifications: false,
    defaultLocation: 'San Francisco, CA',
    analysisDepth: 'standard',
    reportFormat: 'detailed',
    agentPersonality: 'professional',
    dataRetention: 90,
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false
  });

  // Fetch user sessions history
  const { data: sessionHistory, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/user/sessions'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/sessions?limit=20');
      return (await response.json()) as SessionHistory[];
    }
  });

  // Fetch user preferences
  const { data: userPrefs } = useQuery({
    queryKey: ['/api/user/preferences'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/preferences');
      return await response.json();
    }
  });

  // Update preferences when data changes
  useEffect(() => {
    if (userPrefs) {
      setPreferences(prev => ({ ...prev, ...userPrefs }));
    }
  }, [userPrefs]);

  // Handle unauthorized access
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        router.push("/api/login");
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast, router]);

  // Initialize form data with user info
  useEffect(() => {
    if (user) {
      const userTyped = user as any;
      setFormData({
        firstName: userTyped.firstName || '',
        lastName: userTyped.lastName || '',
        email: userTyped.email || '',
        businessType: userTyped.businessType || 'restaurant'
      });
      setPreferences(prev => ({
        ...prev,
        businessType: userTyped.businessType || 'restaurant'
      }));
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Since we're using Replit Auth, we can't directly update the user profile
      // In a real app, this would update user preferences in our database
      const response = await apiRequest('PATCH', '/api/auth/user', {
        businessType: data.businessType
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/api/login");
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: keyof UserPreferences, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center" data-testid="loading-screen">
        <div className="text-center">
          <div className="bitebase-spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'preferences', name: 'AI Preferences', icon: Brain },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'sessions', name: 'Session History', icon: Clock },
    { id: 'data', name: 'Data & Privacy', icon: Shield },
    { id: 'billing', name: 'Billing & Usage', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-muted/10" data-testid="settings-page">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="space-y-2">
            <Card className="bitebase-translucent-card">
              <CardContent className="p-4">
                <nav className="space-y-1" data-testid="settings-nav">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 p-2 rounded w-full text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted/50 text-muted-foreground'
                        }`}
                        data-testid={`tab-${tab.id}`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'profile' && (
              <Card className="bitebase-glass-panel" data-testid="profile-section">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="block text-sm font-medium mb-1">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full"
                          disabled
                          data-testid="input-first-name"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Name is managed by your authentication provider
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="block text-sm font-medium mb-1">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full"
                          disabled
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full"
                        disabled
                        data-testid="input-email"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email is managed by your authentication provider
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="businessType" className="block text-sm font-medium mb-1">
                        Business Type
                      </Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => handleInputChange('businessType', value)}
                      >
                        <SelectTrigger className="w-full" data-testid="select-business-type">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurant">Restaurant Owner</SelectItem>
                          <SelectItem value="cafe">Cafe Owner</SelectItem>
                          <SelectItem value="food_truck">Food Truck</SelectItem>
                          <SelectItem value="market_researcher">Market Researcher</SelectItem>
                          <SelectItem value="investor">Investor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bitebase-button-primary"
                      disabled={updateProfileMutation.isPending}
                      data-testid="update-profile-button"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'preferences' && (
              <Card className="bitebase-glass-panel" data-testid="preferences-section">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">AI Assistant Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3" data-testid="preference-proactive-insights">
                      <Checkbox
                        checked={preferences.proactiveInsights}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange('proactiveInsights', !!checked)
                        }
                        className="border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="text-sm font-medium">Enable proactive market insights</div>
                        <div className="text-xs text-muted-foreground">
                          AI will suggest opportunities and risks automatically
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3" data-testid="preference-auto-update">
                      <Checkbox
                        checked={preferences.autoUpdateMapLayers}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange('autoUpdateMapLayers', !!checked)
                        }
                        className="border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="text-sm font-medium">Auto-update map layers based on conversation</div>
                        <div className="text-xs text-muted-foreground">
                          Map will automatically show relevant data as you chat
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3" data-testid="preference-notifications">
                      <Checkbox
                        checked={preferences.weeklyTrendNotifications}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange('weeklyTrendNotifications', !!checked)
                        }
                        className="border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="text-sm font-medium">Weekly market trend notifications</div>
                        <div className="text-xs text-muted-foreground">
                          Receive weekly emails about market changes in your areas
                        </div>
                      </div>
                    </label>

                    <Separator />

                    {/* Enhanced AI Preferences */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Default Analysis Depth</Label>
                        <Select
                          value={preferences.analysisDepth}
                          onValueChange={(value) => handlePreferenceChange('analysisDepth', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic - Quick overview</SelectItem>
                            <SelectItem value="standard">Standard - Balanced analysis</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive - Deep dive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Agent Personality</Label>
                        <Select
                          value={preferences.agentPersonality}
                          onValueChange={(value) => handlePreferenceChange('agentPersonality', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional - Formal and precise</SelectItem>
                            <SelectItem value="friendly">Friendly - Conversational and approachable</SelectItem>
                            <SelectItem value="analytical">Analytical - Data-focused and technical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Default Location</Label>
                        <Input
                          value={preferences.defaultLocation}
                          onChange={(e) => handlePreferenceChange('defaultLocation', e.target.value)}
                          placeholder="Enter your default search location"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'data-sources' && (
              <Card className="bitebase-glass-panel" data-testid="data-sources-section">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Connected Data Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium text-sm">Google Maps API</div>
                        <div className="text-xs text-muted-foreground">Location and business data</div>
                      </div>
                    </div>
                    <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded" data-testid="status-google-maps">
                      Connected
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium text-sm">Census Data API</div>
                        <div className="text-xs text-muted-foreground">Demographics and statistics</div>
                      </div>
                    </div>
                    <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded" data-testid="status-census-data">
                      Connected
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">Foot Traffic Analytics</div>
                        <div className="text-xs text-muted-foreground">Real-time pedestrian data</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded" data-testid="status-foot-traffic">
                      Available
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Data sources are automatically configured and maintained. Contact support if you need access to additional data providers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session History */}
            {activeTab === 'sessions' && (
              <Card className="bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock size={20} />
                    <span>Session History</span>
                  </CardTitle>
                  <CardDescription>View and manage your research sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="animate-spin mr-2" size={16} />
                      <span>Loading sessions...</span>
                    </div>
                  ) : sessionHistory && sessionHistory.length > 0 ? (
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {sessionHistory.map((session) => (
                          <div key={session.id} className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium">{session.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Created {new Date(session.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                                {session.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>{session.messageCount} messages</span>
                              <span>{session.analysisCount} analyses</span>
                              {session.reportGenerated && (
                                <Badge variant="outline" className="text-xs">
                                  <Download size={10} className="mr-1" />
                                  Report
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="mx-auto mb-4 text-muted-foreground" size={48} />
                      <p className="text-muted-foreground">No sessions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <Card className="bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell size={20} />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription>Manage how you receive updates and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">Receive updates via email</div>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Push Notifications</div>
                        <div className="text-sm text-muted-foreground">Browser notifications for real-time updates</div>
                      </div>
                      <Switch
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Marketing Communications</div>
                        <div className="text-sm text-muted-foreground">Product updates and market insights</div>
                      </div>
                      <Switch
                        checked={preferences.marketingEmails}
                        onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data & Privacy */}
            {activeTab === 'data' && (
              <Card className="bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield size={20} />
                    <span>Data & Privacy</span>
                  </CardTitle>
                  <CardDescription>Control your data and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Data Retention Period</Label>
                    <Select
                      value={preferences.dataRetention.toString()}
                      onValueChange={(value) => handlePreferenceChange('dataRetention', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">6 months</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      How long to keep your session data and analysis history
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2" size={16} />
                      Export My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                      <Trash2 className="mr-2" size={16} />
                      Delete All Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing & Usage */}
            {activeTab === 'billing' && (
              <Card className="bg-background/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star size={20} />
                    <span>Billing & Usage</span>
                  </CardTitle>
                  <CardDescription>Manage your subscription and usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">15</div>
                      <div className="text-sm text-muted-foreground">Sessions this month</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">42</div>
                      <div className="text-sm text-muted-foreground">Reports generated</div>
                    </div>
                  </div>

                  <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">Pro Plan</div>
                      <Badge className="bg-primary">Active</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Unlimited sessions, advanced AI agents, priority support
                    </div>
                    <div className="text-lg font-bold mt-2">$29/month</div>
                  </div>

                  <Button className="w-full">Manage Subscription</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
