import React from 'react'
import { CreateBlogSiteForm } from '@/components/blog/CreateBlogSiteForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export function CreateBlogSite() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Create Blog Site
        </h1>
        <p className="dashboard-subtitle">
          Set up a new blog site to start publishing content
        </p>
      </div>

      <Card className="card-hover shadow-lg">
        <CardHeader>
          <CardTitle>Blog Site Details</CardTitle>
          <CardDescription>
            Enter the basic information for your new blog site. You can customize more settings later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateBlogSiteForm />
        </CardContent>
      </Card>
    </div>
  )
}