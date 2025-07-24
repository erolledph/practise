/**
 * Content management utilities
 */

import { BlogPost, Product } from '@/types'

export interface ContentStats {
  total: number
  published: number
  draft: number
  categories: Record<string, number>
  tags: Record<string, number>
  recentActivity: Array<{
    id: string
    title: string
    type: 'created' | 'updated' | 'published'
    date: Date
  }>
}

/**
 * Calculate statistics for blog posts
 */
export function calculateBlogStats(posts: BlogPost[]): ContentStats {
  const stats: ContentStats = {
    total: posts.length,
    published: 0,
    draft: 0,
    categories: {},
    tags: {},
    recentActivity: []
  }

  posts.forEach(post => {
    // Count by status
    if (post.status === 'published') {
      stats.published++
    } else {
      stats.draft++
    }

    // Count categories
    post.categories.forEach(category => {
      stats.categories[category] = (stats.categories[category] || 0) + 1
    })

    // Count tags
    post.tags.forEach(tag => {
      stats.tags[tag] = (stats.tags[tag] || 0) + 1
    })

    // Add to recent activity
    stats.recentActivity.push({
      id: post.id,
      title: post.title,
      type: post.publishDate ? 'published' : 'created',
      date: post.publishDate || post.createdAt
    })
  })

  // Sort recent activity by date
  stats.recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime())
  stats.recentActivity = stats.recentActivity.slice(0, 10)

  return stats
}

/**
 * Calculate statistics for products
 */
export function calculateProductStats(products: Product[]): ContentStats {
  const stats: ContentStats = {
    total: products.length,
    published: 0,
    draft: 0,
    categories: {},
    tags: {},
    recentActivity: []
  }

  products.forEach(product => {
    // Count by status
    if (product.status === 'published') {
      stats.published++
    } else {
      stats.draft++
    }

    // Count categories
    if (product.category) {
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1
    }

    // Count tags
    product.tags.forEach(tag => {
      stats.tags[tag] = (stats.tags[tag] || 0) + 1
    })

    // Add to recent activity
    stats.recentActivity.push({
      id: product.id,
      title: product.name,
      type: 'created',
      date: product.createdAt
    })
  })

  // Sort recent activity by date
  stats.recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime())
  stats.recentActivity = stats.recentActivity.slice(0, 10)

  return stats
}

/**
 * Generate content summary for SEO
 */
export function generateContentSummary(content: string, maxLength: number = 155): string {
  // Remove HTML tags and extra whitespace
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleanContent.length <= maxLength) {
    return cleanContent
  }

  // Find the last complete sentence within the limit
  const truncated = cleanContent.substring(0, maxLength)
  const lastSentence = truncated.lastIndexOf('.')
  
  if (lastSentence > maxLength * 0.7) {
    return cleanContent.substring(0, lastSentence + 1)
  }

  // If no good sentence break, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  return cleanContent.substring(0, lastSpace) + '...'
}

/**
 * Extract reading time from content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

/**
 * Generate table of contents from markdown content
 */
export function generateTableOfContents(content: string): Array<{
  id: string
  title: string
  level: number
}> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const toc: Array<{ id: string; title: string; level: number }> = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const title = match[2].trim()
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    
    toc.push({ id, title, level })
  }

  return toc
}

/**
 * Validate content before publishing
 */
export function validateContentForPublishing(content: BlogPost | Product): {
  isValid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  // Common validations
  if (!content.title || content.title.trim().length === 0) {
    errors.push('Title is required')
  }

  if (content.title && content.title.length < 3) {
    warnings.push('Title is very short')
  }

  if (content.title && content.title.length > 60) {
    warnings.push('Title is longer than recommended for SEO')
  }

  // Blog post specific validations
  if ('content' in content) {
    const blogPost = content as BlogPost
    
    if (!blogPost.content || blogPost.content.trim().length === 0) {
      errors.push('Content is required')
    }

    if (blogPost.content && blogPost.content.length < 100) {
      warnings.push('Content is very short')
    }

    if (!blogPost.author || blogPost.author.trim().length === 0) {
      errors.push('Author is required')
    }

    if (!blogPost.metaDescription) {
      warnings.push('Meta description is missing')
    }

    if (blogPost.metaDescription && blogPost.metaDescription.length > 160) {
      warnings.push('Meta description is longer than recommended')
    }

    if (blogPost.categories.length === 0) {
      warnings.push('No categories assigned')
    }
  }

  // Product specific validations
  if ('price' in content) {
    const product = content as Product
    
    if (product.price <= 0) {
      errors.push('Price must be greater than 0')
    }

    if (!product.description) {
      warnings.push('Product description is missing')
    }

    if (!product.imageUrl && product.imageUrls.length === 0) {
      warnings.push('No product images uploaded')
    }

    if (!product.category) {
      warnings.push('Product category is not set')
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  }
}

/**
 * Generate content URL for public access
 */
export function generateContentUrl(
  userId: string,
  siteId: string,
  slug: string,
  type: 'blog' | 'product'
): string {
  const baseUrl = window.location.origin
  
  if (type === 'blog') {
    return `${baseUrl}/users/${userId}/blogs/${siteId}/api/content/${slug}.json`
  } else {
    return `${baseUrl}/users/${userId}/productSites/${siteId}/api/products/${slug}.json`
  }
}