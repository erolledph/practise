import React from 'react'
import { useParams } from 'react-router-dom'
import { CreateProductForm } from '@/components/products/CreateProductForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function CreateProduct() {
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
          <ShoppingCart className="h-8 w-8 text-primary" />
          Create Product
        </h1>
        <p className="dashboard-subtitle">
          Add a new product to "{productSite.name}"
        </p>
      </div>

      <Card className="card-hover shadow-lg">
        <CardHeader>
          <CardTitle>New Product</CardTitle>
          <CardDescription>
            Fill in the details below to add a new product to your catalog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProductForm siteId={siteId!} siteName={productSite.name} defaultCurrency={productSite.defaultCurrency} />
        </CardContent>
      </Card>
    </div>
  )
}