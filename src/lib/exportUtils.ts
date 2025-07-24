/**
 * Utilities for exporting content data in various formats
 */

import { BlogPost, Product } from '@/types'

export interface ExportOptions {
  format: 'json' | 'csv' | 'markdown'
  includeMetadata?: boolean
  dateFormat?: string
}

/**
 * Export blog posts to various formats
 */
export function exportBlogPosts(posts: BlogPost[], options: ExportOptions): string {
  switch (options.format) {
    case 'json':
      return JSON.stringify(posts, null, 2)
    
    case 'csv':
      return exportBlogPostsToCSV(posts, options)
    
    case 'markdown':
      return exportBlogPostsToMarkdown(posts, options)
    
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

/**
 * Export products to various formats
 */
export function exportProducts(products: Product[], options: ExportOptions): string {
  switch (options.format) {
    case 'json':
      return JSON.stringify(products, null, 2)
    
    case 'csv':
      return exportProductsToCSV(products, options)
    
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

/**
 * Export blog posts to CSV format
 */
function exportBlogPostsToCSV(posts: BlogPost[], options: ExportOptions): string {
  const headers = [
    'Title',
    'Slug',
    'Author',
    'Status',
    'Categories',
    'Tags',
    'Created At',
    'Updated At',
    'Published At'
  ]

  if (options.includeMetadata) {
    headers.push('Meta Description', 'SEO Title', 'Keywords', 'Featured Image')
  }

  const rows = posts.map(post => {
    const row = [
      escapeCSV(post.title),
      escapeCSV(post.slug),
      escapeCSV(post.author),
      escapeCSV(post.status),
      escapeCSV(post.categories.join(', ')),
      escapeCSV(post.tags.join(', ')),
      formatDate(post.createdAt, options.dateFormat),
      formatDate(post.updatedAt, options.dateFormat),
      post.publishDate ? formatDate(post.publishDate, options.dateFormat) : ''
    ]

    if (options.includeMetadata) {
      row.push(
        escapeCSV(post.metaDescription || ''),
        escapeCSV(post.seoTitle || ''),
        escapeCSV(post.keywords.join(', ')),
        escapeCSV(post.featuredImageUrl || '')
      )
    }

    return row
  })

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

/**
 * Export products to CSV format
 */
function exportProductsToCSV(products: Product[], options: ExportOptions): string {
  const headers = [
    'Name',
    'Slug',
    'Price',
    'Original Price',
    'Currency',
    'Category',
    'Tags',
    'Status',
    'Created At',
    'Updated At'
  ]

  if (options.includeMetadata) {
    headers.push('Description', 'Image URL', 'Product URL')
  }

  const rows = products.map(product => {
    const row = [
      escapeCSV(product.name),
      escapeCSV(product.slug),
      product.price.toString(),
      product.originalPrice.toString(),
      escapeCSV(product.currency),
      escapeCSV(product.category || ''),
      escapeCSV(product.tags.join(', ')),
      escapeCSV(product.status),
      formatDate(product.createdAt, options.dateFormat),
      formatDate(product.updatedAt, options.dateFormat)
    ]

    if (options.includeMetadata) {
      row.push(
        escapeCSV(product.description || ''),
        escapeCSV(product.imageUrl || ''),
        escapeCSV(product.productUrl || '')
      )
    }

    return row
  })

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

/**
 * Export blog posts to Markdown format
 */
function exportBlogPostsToMarkdown(posts: BlogPost[], options: ExportOptions): string {
  return posts.map(post => {
    let markdown = `# ${post.title}\n\n`
    
    if (options.includeMetadata) {
      markdown += `**Author:** ${post.author}\n`
      markdown += `**Status:** ${post.status}\n`
      markdown += `**Created:** ${formatDate(post.createdAt, options.dateFormat)}\n`
      
      if (post.categories.length > 0) {
        markdown += `**Categories:** ${post.categories.join(', ')}\n`
      }
      
      if (post.tags.length > 0) {
        markdown += `**Tags:** ${post.tags.join(', ')}\n`
      }
      
      if (post.metaDescription) {
        markdown += `**Description:** ${post.metaDescription}\n`
      }
      
      markdown += '\n---\n\n'
    }
    
    markdown += post.content
    
    return markdown
  }).join('\n\n---\n\n')
}

/**
 * Escape CSV values
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Format date for export
 */
function formatDate(date: Date | string, format?: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'iso') {
    return dateObj.toISOString()
  }
  
  return dateObj.toLocaleDateString()
}

/**
 * Download exported data as file
 */
export function downloadExport(data: string, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Get appropriate MIME type for export format
 */
export function getMimeType(format: string): string {
  switch (format) {
    case 'json':
      return 'application/json'
    case 'csv':
      return 'text/csv'
    case 'markdown':
      return 'text/markdown'
    default:
      return 'text/plain'
  }
}