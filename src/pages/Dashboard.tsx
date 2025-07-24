import React from 'react'
import { FileText, ShoppingCart, BarChart3, HardDrive } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'

export function Dashboard() {
  const { userData } = useAuth()

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner-lg"></div>
      </div>
    )
  }

  const blogSitesCount = userData.blogSites?.length || 0
  const productSitesCount = userData.productSites?.length || 0
  const totalContent = blogSitesCount + productSitesCount

  return (
    <div className="space-y-6 fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to Firebase CMS</h1>
        <p className="dashboard-subtitle">
          Manage your content and products from one central dashboard.
        </p>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Blog Sites"
          value={blogSitesCount}
          description={`of 3 sites created`}
          icon={FileText}
          trend={blogSitesCount > 0 ? { value: 12, isPositive: true } : undefined}
        />
        <StatsCard
          title="Product Sites"
          value={productSitesCount}
          description={`of 3 sites created`}
          icon={ShoppingCart}
          trend={productSitesCount > 0 ? { value: 8, isPositive: true } : undefined}
        />
        <StatsCard
          title="Total Content"
          value={totalContent}
          description="posts and products"
          icon={BarChart3}
          trend={totalContent > 0 ? { value: 15, isPositive: true } : undefined}
        />
        <StatsCard
          title="Storage Used"
          value="0 MB"
          description="of available storage"
          icon={HardDrive}
        />
      </div>

      <div className="content-grid">
        <div className="lg:col-span-2">
          <QuickActions userData={userData} />
        </div>
        
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm text-muted-foreground">{userData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Plan:</span>
                <span className={`text-sm capitalize px-2 py-1 rounded-full ${userData.plan === 'premium' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                  {userData.plan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Member since:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(userData.createdAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}