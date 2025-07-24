import React from 'react'
import { useParams } from 'react-router-dom'
import { Settings, Store, Calendar, ShoppingCart, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'

export function ProductSiteSettings() {
  const { siteId } = useParams<{ siteId: string }>()
  const { userData } = useAuth()

  const productSite = userData?.productSites?.find(site => site.id === siteId)

  if (!productSite) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 fade-in">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-2">Product Site Not Found</h1>
          <p className="text-muted-foreground">The requested product site could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Product Site Settings
        </h1>
        <p className="dashboard-subtitle">
          Manage settings for "{productSite.name}"
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Site Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Site Name</label>
                <p className="text-lg font-semibold">{productSite.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">URL Slug</label>
                <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{productSite.slug}</p>
              </div>
              
              {productSite.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{productSite.description}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Site ID</label>
                <p className="font-mono text-xs text-muted-foreground">{productSite.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Product Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Products</span>
                <Badge variant="secondary">{productSite.productCount || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Published Products</span>
                <Badge className="status-published">0</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Draft Products</span>
                <Badge className="status-draft">0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Default Currency</label>
                <p className="text-lg font-semibold">{productSite.defaultCurrency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDate(productSite.createdAt)}</p>
              </div>
              
              {productSite.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{formatDate(productSite.updatedAt)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Advanced settings such as payment integration, shipping configuration, and inventory management will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}