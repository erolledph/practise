import React from 'react'
import { BarChart3, TrendingUp, Users, Eye, Clock, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsCard } from '@/components/dashboard/StatsCard'

export function Analytics() {
  return (
    <div className="space-y-6 fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Analytics
        </h1>
        <p className="dashboard-subtitle">
          Track your content performance and audience engagement
        </p>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Total Views"
          value="12,543"
          description="across all sites"
          icon={Eye}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Unique Visitors"
          value="3,247"
          description="this month"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Avg. Session"
          value="2m 34s"
          description="time on site"
          icon={Clock}
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title="Top Countries"
          value="23"
          description="countries reached"
          icon={Globe}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Page Views</span>
                    <span className="text-sm text-green-600 font-medium">+12.5%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Engagement Rate</span>
                    <span className="text-sm text-green-600 font-medium">+8.3%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className="text-sm text-red-600 font-medium">-3.2%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-destructive h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Getting Started Guide</p>
                      <p className="text-sm text-muted-foreground">Blog Post</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">2,543 views</p>
                      <p className="text-sm text-green-600">+15%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Product Showcase</p>
                      <p className="text-sm text-muted-foreground">Product Page</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">1,892 views</p>
                      <p className="text-sm text-green-600">+8%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Tutorial Series</p>
                      <p className="text-sm text-muted-foreground">Blog Post</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">1,234 views</p>
                      <p className="text-sm text-green-600">+12%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Audience analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Traffic analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}