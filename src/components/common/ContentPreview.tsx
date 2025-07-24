import React from 'react'
import { Eye, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BlogPost, Product } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'

interface ContentPreviewProps {
  content: BlogPost | Product
  type: 'blog' | 'product'
  trigger?: React.ReactNode
}

export function ContentPreview({ content, type, trigger }: ContentPreviewProps) {
  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Eye className="h-4 w-4" />
    </Button>
  )

  const renderBlogPreview = (post: BlogPost) => (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>By {post.author}</span>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
          <Badge className={post.status === 'published' ? 'status-published' : 'status-draft'}>
            {post.status}
          </Badge>
        </div>
      </div>

      {post.featuredImageUrl && (
        <img
          src={post.featuredImageUrl}
          alt={post.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      )}

      {post.metaDescription && (
        <p className="text-muted-foreground italic">{post.metaDescription}</p>
      )}

      <Separator />

      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content.substring(0, 500) + '...' }} />
      </div>

      {(post.categories.length > 0 || post.tags.length > 0) && (
        <>
          <Separator />
          <div className="space-y-2">
            {post.categories.length > 0 && (
              <div>
                <span className="text-sm font-medium">Categories: </span>
                {post.categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="mr-1">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
            {post.tags.length > 0 && (
              <div>
                <span className="text-sm font-medium">Tags: </span>
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="mr-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {post.contentUrl && (
        <div className="pt-4">
          <Button asChild variant="outline" className="w-full">
            <a href={post.contentUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public URL
            </a>
          </Button>
        </div>
      )}
    </div>
  )

  const renderProductPreview = (product: Product) => (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
        <div className="flex items-center gap-2">
          <Badge className={product.status === 'published' ? 'status-published' : 'status-draft'}>
            {product.status}
          </Badge>
          {product.category && (
            <Badge variant="outline">{product.category}</Badge>
          )}
        </div>
      </div>

      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
        />
      )}

      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold text-primary">
          {formatPrice(product.price, product.currency)}
        </div>
        {product.originalPrice > product.price && (
          <div className="flex items-center gap-2">
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
            <Badge variant="destructive">
              {product.percentOff}% off
            </Badge>
          </div>
        )}
      </div>

      {product.description && (
        <>
          <Separator />
          <p className="text-muted-foreground">{product.description}</p>
        </>
      )}

      {product.tags.length > 0 && (
        <>
          <Separator />
          <div>
            <span className="text-sm font-medium">Tags: </span>
            {product.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="mr-1">
                {tag}
              </Badge>
            ))}
          </div>
        </>
      )}

      <div className="text-sm text-muted-foreground">
        <p>Created: {formatDate(product.createdAt)}</p>
        <p>Updated: {formatDate(product.updatedAt)}</p>
      </div>

      {product.productUrl && (
        <div className="pt-4">
          <Button asChild variant="outline" className="w-full">
            <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Product Page
            </a>
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === 'blog' ? 'Blog Post Preview' : 'Product Preview'}
          </DialogTitle>
        </DialogHeader>
        {type === 'blog' 
          ? renderBlogPreview(content as BlogPost)
          : renderProductPreview(content as Product)
        }
      </DialogContent>
    </Dialog>
  )
}