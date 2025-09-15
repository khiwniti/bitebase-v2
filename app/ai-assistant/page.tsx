'use client'

import { CopilotChat } from '@copilotkit/react-ui'
import { useCopilotAction } from '@copilotkit/react-core'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, TrendingUp, MapPin, Scale } from 'lucide-react'

interface MarketResearchData {
  location?: string
  demographics?: any
  competitors?: any
  traffic?: any
  sites?: any
  zoning?: any
}

export default function AIAssistant() {
  const [researchData, setResearchData] = useState<MarketResearchData>({})

  // Define CopilotKit actions that the AI can use
  useCopilotAction({
    name: 'analyzeMarketDemographics',
    description: 'Analyze the demographic data for a specific location',
    parameters: [
      {
        name: 'location',
        type: 'string',
        description: 'The location to analyze demographics for',
        required: true,
      },
    ],
    handler: async ({ location }) => {
      // This would integrate with our LangGraph agents
      const result = {
        location,
        population: '250,000+',
        medianIncome: '$75,000',
        ageGroups: { '25-34': '28%', '35-44': '22%', '45-54': '18%' },
        diningPreferences: ['Fast Casual', 'Health Conscious', 'Family Dining']
      }
      
      setResearchData(prev => ({ ...prev, location, demographics: result }))
      return `Demographics analysis for ${location}: Population ${result.population}, Median Income ${result.medianIncome}. Key dining preferences include ${result.diningPreferences.join(', ')}.`
    },
  })

  useCopilotAction({
    name: 'analyzeCompetitors',
    description: 'Analyze competitors in the specified location',
    parameters: [
      {
        name: 'location',
        type: 'string',
        description: 'The location to analyze competitors for',
        required: true,
      },
      {
        name: 'cuisineType',
        type: 'string',
        description: 'Type of cuisine to focus on',
        required: false,
      },
    ],
    handler: async ({ location, cuisineType }) => {
      const result = {
        totalCompetitors: 15,
        averageRating: 4.2,
        priceRange: '$15-25',
        topCompetitors: ['Restaurant A', 'Restaurant B', 'Restaurant C'],
        marketGap: 'Premium casual dining with outdoor seating'
      }
      
      setResearchData(prev => ({ ...prev, competitors: result }))
      return `Competitor analysis for ${location}: ${result.totalCompetitors} competitors, average rating ${result.averageRating}. Market gap identified: ${result.marketGap}.`
    },
  })

  useCopilotAction({
    name: 'analyzeTrafficPatterns',
    description: 'Analyze foot traffic and transportation patterns',
    parameters: [
      {
        name: 'location',
        type: 'string',
        description: 'The location to analyze traffic for',
        required: true,
      },
    ],
    handler: async ({ location }) => {
      const result = {
        peakHours: ['12:00-14:00', '18:00-20:00'],
        weekdayTraffic: 'High',
        weekendTraffic: 'Very High',
        publicTransit: 'Excellent access',
        parking: 'Limited street parking'
      }
      
      setResearchData(prev => ({ ...prev, traffic: result }))
      return `Traffic analysis for ${location}: Peak hours ${result.peakHours.join(', ')}, ${result.publicTransit}, ${result.parking}.`
    },
  })

  useCopilotAction({
    name: 'findSites',
    description: 'Find and analyze potential restaurant sites',
    parameters: [
      {
        name: 'location',
        type: 'string',
        description: 'The area to search for sites',
        required: true,
      },
      {
        name: 'budget',
        type: 'string',
        description: 'Budget range for rent',
        required: false,
      },
    ],
    handler: async ({ location, budget }) => {
      const result = {
        availableSites: 3,
        sites: [
          { address: '123 Main St', rent: '$8,000/month', sqft: 2000, pros: 'High foot traffic', cons: 'Limited parking' },
          { address: '456 Oak Ave', rent: '$6,500/month', sqft: 1800, pros: 'Corner location', cons: 'Smaller space' },
          { address: '789 Pine St', rent: '$9,200/month', sqft: 2400, pros: 'New construction', cons: 'Higher rent' }
        ]
      }
      
      setResearchData(prev => ({ ...prev, sites: result }))
      return `Found ${result.availableSites} potential sites in ${location}. Top recommendation: ${result.sites[0].address} - ${result.sites[0].rent}, ${result.sites[0].sqft} sqft.`
    },
  })

  useCopilotAction({
    name: 'checkZoning',
    description: 'Check zoning regulations and permit requirements',
    parameters: [
      {
        name: 'address',
        type: 'string',
        description: 'The specific address to check zoning for',
        required: true,
      },
    ],
    handler: async ({ address }) => {
      const result = {
        zoning: 'Commercial C-2',
        restaurantAllowed: true,
        permits: ['Business License', 'Food Service Permit', 'Liquor License (if needed)'],
        restrictions: 'Hours limited to 6AM-11PM',
        estimatedTime: '4-6 weeks'
      }
      
      setResearchData(prev => ({ ...prev, zoning: result }))
      return `Zoning check for ${address}: ${result.zoning}, restaurant use allowed. Required permits: ${result.permits.join(', ')}. Processing time: ${result.estimatedTime}.`
    },
  })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-green-700">BiteBase AI Assistant</h1>
            <p className="text-gray-600 mt-1">Get comprehensive restaurant market research and site analysis</p>
          </div>
          <div className="h-[calc(100vh-200px)]">
            <CopilotChat
              labels={{
                title: "Restaurant Market Research",
                initial: "Hi! I'm your BiteBase AI assistant. I can help you with:\n\n• Market demographics analysis\n• Competitor research\n• Traffic pattern analysis\n• Site recommendations\n• Zoning and permit information\n\nWhat would you like to research today?",
              }}
              className="h-full"
            />
          </div>
        </div>

        {/* Research Data Panel */}
        <div className="space-y-4 overflow-y-auto max-h-screen">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {researchData.location ? (
                <Badge variant="outline">{researchData.location}</Badge>
              ) : (
                <p className="text-gray-500 text-sm">No location analyzed yet</p>
              )}
            </CardContent>
          </Card>

          {researchData.demographics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <strong>Population:</strong> {researchData.demographics.population}
                </div>
                <div className="text-sm">
                  <strong>Median Income:</strong> {researchData.demographics.medianIncome}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {researchData.demographics.diningPreferences?.map((pref: string) => (
                    <Badge key={pref} variant="secondary" className="text-xs">{pref}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {researchData.competitors && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  Competitors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <strong>Total:</strong> {researchData.competitors.totalCompetitors}
                </div>
                <div className="text-sm">
                  <strong>Avg Rating:</strong> {researchData.competitors.averageRating}/5
                </div>
                <div className="text-sm">
                  <strong>Market Gap:</strong> {researchData.competitors.marketGap}
                </div>
              </CardContent>
            </Card>
          )}

          {researchData.traffic && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Traffic Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <strong>Peak Hours:</strong> {researchData.traffic.peakHours?.join(', ')}
                </div>
                <div className="text-sm">
                  <strong>Public Transit:</strong> {researchData.traffic.publicTransit}
                </div>
                <div className="text-sm">
                  <strong>Parking:</strong> {researchData.traffic.parking}
                </div>
              </CardContent>
            </Card>
          )}

          {researchData.sites && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Available Sites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm mb-2">
                  <strong>Found:</strong> {researchData.sites.availableSites} sites
                </div>
                {researchData.sites.sites?.slice(0, 2).map((site: any, index: number) => (
                  <div key={index} className="border rounded p-2 mb-2 text-xs">
                    <div><strong>{site.address}</strong></div>
                    <div>{site.rent} • {site.sqft} sqft</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {researchData.zoning && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  Zoning & Permits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <strong>Zoning:</strong> {researchData.zoning.zoning}
                </div>
                <div className="text-sm">
                  <strong>Restaurant Allowed:</strong> {researchData.zoning.restaurantAllowed ? 'Yes' : 'No'}
                </div>
                <div className="text-sm">
                  <strong>Processing Time:</strong> {researchData.zoning.estimatedTime}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}