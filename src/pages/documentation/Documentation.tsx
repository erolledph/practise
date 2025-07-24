import React from 'react'
import { BookOpen, ExternalLink, Code, Lightbulb, Zap, Copy, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'

export function Documentation() {
  const { userData } = useAuth()
  const { success } = useToastContext()
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(label)
      success('Copied to clipboard!')
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const quickStartSteps = [
    {
      title: 'Create Your First Site',
      description: 'Start by creating either a blog site or product site from the dashboard.',
      icon: Zap
    },
    {
      title: 'Add Content',
      description: 'Create blog posts or add products to your newly created site.',
      icon: Code
    },
    {
      title: 'Customize Settings',
      description: 'Configure your preferences, currency, and other settings.',
      icon: Lightbulb
    }
  ]

  const features = [
    {
      title: 'Blog Management',
      description: 'Create and manage multiple blog sites with rich content editing.',
      status: 'Available'
    },
    {
      title: 'Product Catalogs',
      description: 'Build product sites with pricing, images, and detailed descriptions.',
      status: 'Available'
    },
    {
      title: 'File Manager',
      description: 'Upload and organize your media files with cloud storage.',
      status: 'Available'
    },
    {
      title: 'Analytics',
      description: 'Track performance and engagement across all your sites.',
      status: 'Coming Soon'
    },
    {
      title: 'SEO Tools',
      description: 'Optimize your content for search engines.',
      status: 'Coming Soon'
    },
    {
      title: 'Custom Domains',
      description: 'Connect your own domain names to your sites.',
      status: 'Coming Soon'
    }
  ]

  return (
    <div className="space-y-6 fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          Documentation
        </h1>
        <p className="dashboard-subtitle">
          Learn how to make the most of Firebase CMS
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-4">
        <TabsList>
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Welcome to Firebase CMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Firebase CMS is a modern content management system that allows you to create and manage 
                blog sites and product catalogs with ease. Built with React, TypeScript, and Firebase, 
                it provides a powerful yet simple interface for content creators.
              </p>
              
              <div className="grid gap-4 md:grid-cols-3">
                {quickStartSteps.map((step, index) => (
                  <Card key={index} className="card-interactive">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <step.icon className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Key Concepts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">Sites</h4>
                  <p className="text-sm text-muted-foreground">
                    You can create up to 3 blog sites and 3 product sites. Each site has its own content and settings.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Content</h4>
                  <p className="text-sm text-muted-foreground">
                    Blog posts and products are the main content types. Each can have rich text, images, and metadata.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Files</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage images, documents, and other media files through the file manager.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <Badge variant={feature.status === 'Available' ? 'default' : 'secondary'}>
                      {feature.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Public API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Firebase CMS provides public REST API endpoints for accessing your published content. 
                All endpoints are publicly accessible and don't require authentication.
              </p>
              
              {/* Blog Content API */}
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Blog Content API
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Get All Blog Posts</h4>
                      <div className="bg-muted p-3 rounded font-mono text-sm mb-2">
                        GET /users/{userData?.uid || '{uid}'}/blogs/{'{blogId}'}/api/content.json
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Returns all published blog posts for a specific blog site.
                      </p>
                      
                      {userData?.blogSites && userData.blogSites.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Your Blog Sites:</p>
                          {userData.blogSites.map((site) => (
                            <div key={site.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              <code className="text-xs flex-1">
                                {window.location.origin}/users/{userData.uid}/blogs/{site.id}/api/content.json
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(
                                  `${window.location.origin}/users/${userData.uid}/blogs/${site.id}/api/content.json`,
                                  `blog-${site.id}`
                                )}
                              >
                                {copiedCode === `blog-${site.id}` ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <details className="mt-4">
                        <summary className="cursor-pointer font-medium">Example Response</summary>
                        <pre className="bg-muted p-4 rounded mt-2 text-xs overflow-x-auto">
{`{
  "site": {
    "id": "blog_123",
    "name": "My Tech Blog",
    "slug": "my-tech-blog",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "posts": [
    {
      "id": "post_456",
      "title": "Getting Started with React",
      "slug": "getting-started-with-react",
      "content": "# Getting Started with React\\n\\nReact is a...",
      "author": "John Doe",
      "featuredImageUrl": "https://example.com/image.jpg",
      "metaDescription": "Learn the basics of React development",
      "categories": ["Technology", "Web Development"],
      "tags": ["react", "javascript", "tutorial"],
      "publishDate": "2024-01-20T14:00:00.000Z",
      "createdAt": "2024-01-20T14:00:00.000Z",
      "updatedAt": "2024-01-20T14:00:00.000Z"
    }
  ],
  "total": 1,
  "generatedAt": "2024-01-21T10:15:30.000Z"
}`}
                        </pre>
                      </details>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Get Single Blog Post</h4>
                      <div className="bg-muted p-3 rounded font-mono text-sm mb-2">
                        GET /users/{userData?.uid || '{uid}'}/blogs/{'{blogId}'}/api/content/{'{slug}'}.json
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Returns a specific blog post by its slug.
                      </p>
                      
                      <details>
                        <summary className="cursor-pointer font-medium">Example Response</summary>
                        <pre className="bg-muted p-4 rounded mt-2 text-xs overflow-x-auto">
{`{
  "id": "post_456",
  "title": "Getting Started with React",
  "slug": "getting-started-with-react",
  "content": "# Getting Started with React\\n\\nReact is a...",
  "author": "John Doe",
  "featuredImageUrl": "https://example.com/image.jpg",
  "metaDescription": "Learn the basics of React development",
  "seoTitle": "Getting Started with React - Complete Guide",
  "keywords": ["react", "javascript", "tutorial"],
  "categories": ["Technology", "Web Development"],
  "tags": ["react", "javascript", "tutorial"],
  "contentUrl": "/blog/blog_123/getting-started-with-react",
  "publishDate": "2024-01-20T14:00:00.000Z",
  "createdAt": "2024-01-20T14:00:00.000Z",
  "updatedAt": "2024-01-20T14:00:00.000Z",
  "site": {
    "id": "blog_123",
    "name": "My Tech Blog",
    "slug": "my-tech-blog"
  }
}`}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
                
                {/* Products API */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Products API
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Get All Products</h4>
                      <div className="bg-muted p-3 rounded font-mono text-sm mb-2">
                        GET /users/{userData?.uid || '{uid}'}/productSites/{'{siteId}'}/api/products.json
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Returns all published products for a specific product site.
                      </p>
                      
                      {userData?.productSites && userData.productSites.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Your Product Sites:</p>
                          {userData.productSites.map((site) => (
                            <div key={site.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              <code className="text-xs flex-1">
                                {window.location.origin}/users/{userData.uid}/productSites/{site.id}/api/products.json
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(
                                  `${window.location.origin}/users/${userData.uid}/productSites/${site.id}/api/products.json`,
                                  `product-${site.id}`
                                )}
                              >
                                {copiedCode === `product-${site.id}` ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <details className="mt-4">
                        <summary className="cursor-pointer font-medium">Example Response</summary>
                        <pre className="bg-muted p-4 rounded mt-2 text-xs overflow-x-auto">
{`{
  "site": {
    "id": "site_789",
    "name": "My Store",
    "slug": "my-store",
    "description": "Quality products for everyone",
    "defaultCurrency": "USD",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "products": [
    {
      "id": "product_123",
      "name": "Wireless Headphones",
      "slug": "wireless-headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 99.99,
      "originalPrice": 129.99,
      "percentOff": 23,
      "savings": 30.00,
      "currency": "USD",
      "imageUrl": "https://example.com/headphones-main.jpg",
      "imageUrls": [
        "https://example.com/headphones-main.jpg",
        "https://example.com/headphones-side.jpg"
      ],
      "productUrl": "https://store.example.com/wireless-headphones",
      "category": "Electronics",
      "tags": ["audio", "wireless", "headphones"],
      "createdAt": "2024-01-20T14:00:00.000Z",
      "updatedAt": "2024-01-20T14:00:00.000Z"
    }
  ],
  "categories": ["Electronics"],
  "productsByCategory": {
    "Electronics": [...]
  },
  "total": 1,
  "generatedAt": "2024-01-21T10:15:30.000Z"
}`}
                        </pre>
                      </details>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Get Single Product</h4>
                      <div className="bg-muted p-3 rounded font-mono text-sm mb-2">
                        GET /users/{userData?.uid || '{uid}'}/productSites/{'{siteId}'}/api/products/{'{slug}'}.json
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Returns a specific product by its slug.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Analytics API */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Analytics API
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Track Events</h4>
                      <div className="bg-muted p-3 rounded font-mono text-sm mb-2">
                        POST /api/analytics/track
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Track user interactions and page views for analytics.
                      </p>
                      
                      <details>
                        <summary className="cursor-pointer font-medium">Example Request Body</summary>
                        <pre className="bg-muted p-4 rounded mt-2 text-xs overflow-x-auto">
{`{
  "type": "view",
  "contentId": "post_456",
  "timestamp": "2024-01-21T10:15:30.000Z",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com",
  "ip": "192.168.1.1",
  "sessionId": "session_abc123",
  "metadata": {
    "path": "/blog/getting-started-with-react",
    "title": "Getting Started with React",
    "category": "blog",
    "tags": ["react", "tutorial"]
  },
  "browserInfo": {
    "language": "en-US",
    "screenResolution": "1920x1080",
    "viewport": "1200x800",
    "timezone": "America/New_York"
  }
}`}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
                
                {/* Code Examples */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Code Examples</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">JavaScript/Fetch</h4>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`// Fetch blog posts
const response = await fetch('/users/USER_ID/blogs/BLOG_ID/api/content.json');
const data = await response.json();

console.log('Blog posts:', data.posts);

// Fetch single post
const postResponse = await fetch('/users/USER_ID/blogs/BLOG_ID/api/content/my-post-slug.json');
const post = await postResponse.json();

console.log('Post:', post);`}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(
                            `// Fetch blog posts\nconst response = await fetch('/users/USER_ID/blogs/BLOG_ID/api/content.json');\nconst data = await response.json();\n\nconsole.log('Blog posts:', data.posts);\n\n// Fetch single post\nconst postResponse = await fetch('/users/USER_ID/blogs/BLOG_ID/api/content/my-post-slug.json');\nconst post = await postResponse.json();\n\nconsole.log('Post:', post);`,
                            'js-example'
                          )}
                        >
                          {copiedCode === 'js-example' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Python/Requests</h4>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`import requests

# Fetch blog posts
response = requests.get('https://yoursite.com/users/USER_ID/blogs/BLOG_ID/api/content.json')
data = response.json()

print('Blog posts:', data['posts'])

# Fetch products
products_response = requests.get('https://yoursite.com/users/USER_ID/productSites/SITE_ID/api/products.json')
products = products_response.json()

print('Products:', products['products'])`}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(
                            `import requests\n\n# Fetch blog posts\nresponse = requests.get('https://yoursite.com/users/USER_ID/blogs/BLOG_ID/api/content.json')\ndata = response.json()\n\nprint('Blog posts:', data['posts'])\n\n# Fetch products\nproducts_response = requests.get('https://yoursite.com/users/USER_ID/productSites/SITE_ID/api/products.json')\nproducts = products_response.json()\n\nprint('Products:', products['products'])`,
                            'python-example'
                          )}
                        >
                          {copiedCode === 'python-example' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Error Handling */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Error Handling</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="destructive">400</Badge>
                      <div>
                        <p className="font-medium">Bad Request</p>
                        <p className="text-sm text-muted-foreground">Missing required parameters</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Badge variant="destructive">404</Badge>
                      <div>
                        <p className="font-medium">Not Found</p>
                        <p className="text-sm text-muted-foreground">User, site, or content not found</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Badge variant="destructive">500</Badge>
                      <div>
                        <p className="font-medium">Internal Server Error</p>
                        <p className="text-sm text-muted-foreground">Server error occurred</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Notes */}
                <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="text-lg font-semibold mb-4">Important Notes</h3>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      All endpoints support CORS and can be called from any domain
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      Responses are cached for 5 minutes to improve performance
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      Only published content is returned by the API
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      All timestamps are in ISO 8601 format (UTC)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      The <code>generatedAt</code> field indicates when the response was created
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Get Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Need help? Here are the best ways to get support for Firebase CMS:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold">Community Forum</h4>
                    <p className="text-sm text-muted-foreground">Ask questions and share knowledge</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Forum
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold">Email Support</h4>
                    <p className="text-sm text-muted-foreground">Direct support for technical issues</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Contact Us
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold">GitHub Issues</h4>
                    <p className="text-sm text-muted-foreground">Report bugs and request features</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}