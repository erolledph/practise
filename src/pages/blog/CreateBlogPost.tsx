import React from 'react'
import { useParams } from 'react-router-dom'
import { CreateBlogPostForm } from '@/components/blog/CreateBlogPostForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function CreateBlogPost() {
  const { siteId } = useParams<{ siteId: string }>()
  const { userData } = useAuth()

  const blogSite = userData?.blogSites?.find(site => site.id === siteId)

  if (!blogSite) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 fade-in">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-2">Blog Site Not Found</h1>
          <p className="text-muted-foreground">The requested blog site could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Create Blog Post
        </h1>
        <p className="dashboard-subtitle">
          Create a new blog post for "{blogSite.name}"
        </p>
      </div>

      <Card className="card-hover shadow-lg">
        <CardHeader>
          <CardTitle>New Blog Post</CardTitle>
          <CardDescription>
            Fill in the details below to create a new blog post for your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateBlogPostForm siteId={siteId!} siteName={blogSite.name} />
        </CardContent>
      </Card>
    </div>
  )
}