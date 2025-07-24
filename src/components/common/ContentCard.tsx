import { MoreHorizontal, Edit, Trash2, Eye, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BlogPost, Product } from '@/types'
import { formatDate } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import { PricingDisplay } from './PricingDisplay'

interface ContentCardProps {
  content: BlogPost | Product
  type: 'blog' | 'product'
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView?: (id: string) => void
  className?: string
}

export function ContentCard({
  content,
  type,
  onEdit,
  onDelete,
  onView,
  className
}: ContentCardProps) {
  const isBlogPost = type === 'blog'
  const blogPost = content as BlogPost
  const product = content as Product

  return (
    <Card className={`card-hover ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">
              {isBlogPost ? blogPost.title : product.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={content.status} />
              {isBlogPost && blogPost.author && (
                <Badge variant="outline" className="text-xs">
                  {blogPost.author}
                </Badge>
              )}
              {!isBlogPost && product.category && (
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(content.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(content.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(content.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Image */}
        {((isBlogPost && blogPost.featuredImageUrl) || (!isBlogPost && product.imageUrl)) && (
          <div className="mb-3">
            <img
              src={isBlogPost ? blogPost.featuredImageUrl : product.imageUrl}
              alt={isBlogPost ? blogPost.title : product.name}
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}

        {/* Content/Description */}
        {isBlogPost ? (
          <div className="space-y-3">
            {blogPost.metaDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {blogPost.metaDescription}
              </p>
            )}
            
            {blogPost.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {blogPost.categories.slice(0, 3).map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {blogPost.categories.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{blogPost.categories.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <PricingDisplay
              price={product.price}
              originalPrice={product.originalPrice}
              currency={product.currency}
              percentOff={product.percentOff}
              savings={product.savings}
            />
            
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}
            
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {product.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{product.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(content.createdAt)}
          </div>
          
          <div className="flex gap-1">
            {onView && (
              <Button variant="ghost" size="sm" onClick={() => onView(content.id)}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onEdit(content.id)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}