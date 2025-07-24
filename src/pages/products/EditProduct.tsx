import React from 'react'
import { useParams } from 'react-router-dom'
import { EditProductForm } from '@/components/products/EditProductForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function EditProduct() {
  const { siteId, productId } = useParams<{ siteId: string; productId: string }>()
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

  if (!productId) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 fade-in">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-2">Product ID Missing</h1>
          <p className="text-muted-foreground">No product ID provided for editing.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          Edit Product
        </h1>
        <p className="dashboard-subtitle">
          Edit product for "{productSite.name}"
        </p>
      </div>

      <Card className="card-hover shadow-lg">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>
            Update the details below to modify your product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditProductForm siteId={siteId!} productId={productId} siteName={productSite.name} defaultCurrency={productSite.defaultCurrency} />
        </CardContent>
      </Card>
    </div>
  )
}