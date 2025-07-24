import React from 'react'
import { CreateProductSiteForm } from '@/components/products/CreateProductSiteForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'

export function CreateProductSite() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          Create Product Site
        </h1>
        <p className="dashboard-subtitle">
          Set up a new product catalog to showcase your products
        </p>
      </div>

      <Card className="card-hover shadow-lg">
        <CardHeader>
          <CardTitle>Product Site Details</CardTitle>
          <CardDescription>
            Enter the basic information for your new product site. You can add products and customize settings later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProductSiteForm />
        </CardContent>
      </Card>
    </div>
  )
}