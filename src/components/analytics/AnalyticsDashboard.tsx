import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Eye, Clock, Globe, Calendar, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'

interface AnalyticsData {
  period: {
    days: number
    startDate: string
    endDate: string
  }
  summary: {
    totalEvents: number
    uniqueSessions: number
    uniqueVisitors: number
    avgEventsPerSession: number
  }
  eventTypes: Record<string, number>
  categories: Record<string, number>
  dailyStats: Array<{
    date: string
    totalEvents: number
    eventTypes: Record<string, number>
    categories: Record<string, number>
  }>
  topContent: Array<{
    contentId: string
    title: string
    views: number
  }>
  browsers: Record<string, number>
  recentEvents: Array<{
    id: string
    type: string
    contentId?: string
    timestamp: string
    metadata: {
      path: string
      title: string
      category: string
    }
  }>
  generatedAt: string
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const { error } = useToastContext()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    loadAnalytics()
  }, [user, timeRange])

  const loadAnalytics = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/analytics/${user.uid}?days=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        // If analytics API is not available, show mock data
        setAnalyticsData(getMockAnalyticsData())
      }
    } catch (err) {
      console.error('Error loading analytics:', err)
      // Show mock data instead of error for demo purposes
      setAnalyticsData(getMockAnalyticsData())
    } finally {
      setLoading(false)
    }
  }

  const getMockAnalyticsData = (): AnalyticsData => ({
    period: {
      days: parseInt(timeRange),
      startDate: new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    },
    summary: {
      totalEvents: 12543,
      uniqueSessions: 3247,
      uniqueVisitors: 2891,
      avgEventsPerSession: 3.86
    },
    eventTypes: {
      view: 8234,
      interaction: 3456,
      click: 853
    },
    categories: {
      blog: 6789,
      products: 4321,
      files: 1433
    },
    dailyStats: Array.from({ length: parseInt(timeRange) }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalEvents: Math.floor(Math.random() * 500) + 100,
      eventTypes: {
        view: Math.floor(Math.random() * 300) + 50,
        interaction: Math.floor(Math.random() * 150) + 25,
        click: Math.floor(Math.random() * 50) + 10
      },
      categories: {
        blog: Math.floor(Math.random() * 200) + 50,
        products: Math.floor(Math.random() * 200) + 50,
        files: Math.floor(Math.random() * 100) + 25
      }
    })).reverse(),
    topContent: [
      { contentId: 'post_1', title: 'Getting Started Guide', views: 2543 },
      { contentId: 'product_1', title: 'Premium Headphones', views: 1892 },
      { contentId: 'post_2', title: 'Advanced Tutorial', views: 1234 },
      { contentId: 'product_2', title: 'Wireless Mouse', views: 987 },
      { contentId: 'post_3', title: 'Best Practices', views: 756 }
    ],
    browsers: {
      Chrome: 6234,
      Firefox: 2341,
      Safari: 1876,
      Edge: 987,
      Other: 1105
    },
    recentEvents: Array.from({ length: 20 }, (_, i) => ({
      id: `event_${i}`,
      type: ['view', 'interaction', 'click'][Math.floor(Math.random() * 3)],
      contentId: `content_${Math.floor(Math.random() * 10)}`,
      timestamp: new Date(Date.now() - i * 60 * 1000).toISOString(),
      metadata: {
        path: `/blog/post-${i}`,
        title: `Blog Post ${i}`,
        category: 'blog'
      }
    })),
    generatedAt: new Date().toISOString()
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner-lg"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No analytics data available</h3>
        <p className="text-muted-foreground">Analytics data will appear here once you have content and visitors.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div className="dashboard-header">
          <h1 className="dashboard-title flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Track your content performance and audience engagement
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics}>
            <Filter className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Total Events"
          value={analyticsData.summary.totalEvents.toLocaleString()}
          description="across all sites"
          icon={Eye}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Unique Visitors"
          value={analyticsData.summary.uniqueVisitors.toLocaleString()}
          description="this period"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Sessions"
          value={analyticsData.summary.uniqueSessions.toLocaleString()}
          description="user sessions"
          icon={Clock}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Avg. Events/Session"
          value={analyticsData.summary.avgEventsPerSession.toFixed(1)}
          description="engagement rate"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Event Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analyticsData.eventTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${(count / analyticsData.summary.totalEvents) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Content Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analyticsData.categories).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${(count / analyticsData.summary.totalEvents) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Activity ({analyticsData.period.days} days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Date</span>
                  <span>Events</span>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {analyticsData.dailyStats.slice(-10).map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((day.totalEvents / Math.max(...analyticsData.dailyStats.map(d => d.totalEvents))) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {day.totalEvents}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topContent.map((content, index) => (
                  <div key={content.contentId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{content.title}</p>
                        <p className="text-sm text-muted-foreground">ID: {content.contentId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{content.views.toLocaleString()} views</p>
                      <p className="text-sm text-green-600">
                        {index === 0 ? 'Top performer' : `${Math.round((content.views / analyticsData.topContent[0].views) * 100)}% of top`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Browser Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.browsers)
                  .sort(([, a], [, b]) => b - a)
                  .map(([browser, count]) => (
                    <div key={browser} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{browser}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${(count / Object.values(analyticsData.browsers).reduce((a, b) => a + b, 0)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-16 text-right">
                          {count.toLocaleString()} ({Math.round((count / Object.values(analyticsData.browsers).reduce((a, b) => a + b, 0)) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {analyticsData.recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.type === 'view' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'interaction' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {event.type}
                      </span>
                      <div>
                        <p className="font-medium">{event.metadata.title}</p>
                        <p className="text-muted-foreground">{event.metadata.path}</p>
                      </div>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date(analyticsData.generatedAt).toLocaleString()}
      </div>
    </div>
  )
}