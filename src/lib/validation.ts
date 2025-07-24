/**
 * Validation utilities for forms and data
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface BlogPostValidation {
  title: string
  content: string
  author: string
  status: 'draft' | 'published'
  slug?: string
  categories?: string[]
  tags?: string[]
  keywords?: string[]
}

export interface ProductValidation {
  name: string
  price: number
  originalPrice?: number
  currency: string
  status: 'draft' | 'published'
  slug?: string
  category?: string
  tags?: string[]
}

/**
 * Validate blog post data
 */
export function validateBlogPost(data: Partial<BlogPostValidation>): ValidationResult {
  const errors: string[] = []

  // Required fields
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required')
  } else if (data.title.length < 3) {
    errors.push('Title must be at least 3 characters long')
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters')
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required')
  } else if (data.content.length < 10) {
    errors.push('Content must be at least 10 characters long')
  }

  if (!data.author || data.author.trim().length === 0) {
    errors.push('Author is required')
  }

  if (!data.status || !['draft', 'published'].includes(data.status)) {
    errors.push('Status must be either draft or published')
  }

  // Optional field validation
  if (data.slug && (data.slug.length > 100 || !/^[a-z0-9-]+$/.test(data.slug))) {
    errors.push('Slug must be lowercase letters, numbers, and hyphens only, max 100 characters')
  }

  if (data.categories && data.categories.length > 10) {
    errors.push('Maximum 10 categories allowed')
  }

  if (data.tags && data.tags.length > 20) {
    errors.push('Maximum 20 tags allowed')
  }

  if (data.keywords && data.keywords.length > 15) {
    errors.push('Maximum 15 keywords allowed')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate product data
 */
export function validateProduct(data: Partial<ProductValidation>): ValidationResult {
  const errors: string[] = []

  // Required fields
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Product name is required')
  } else if (data.name.length < 3) {
    errors.push('Product name must be at least 3 characters long')
  } else if (data.name.length > 200) {
    errors.push('Product name must be less than 200 characters')
  }

  if (data.price === undefined || data.price === null) {
    errors.push('Price is required')
  } else if (data.price < 0) {
    errors.push('Price must be positive')
  } else if (data.price > 999999.99) {
    errors.push('Price must be less than 1,000,000')
  }

  if (!data.currency || data.currency.trim().length === 0) {
    errors.push('Currency is required')
  } else if (!['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].includes(data.currency)) {
    errors.push('Invalid currency')
  }

  if (!data.status || !['draft', 'published'].includes(data.status)) {
    errors.push('Status must be either draft or published')
  }

  // Optional field validation
  if (data.originalPrice !== undefined && data.originalPrice < 0) {
    errors.push('Original price must be positive')
  }

  if (data.originalPrice !== undefined && data.price !== undefined && data.originalPrice < data.price) {
    errors.push('Original price must be greater than or equal to current price')
  }

  if (data.slug && (data.slug.length > 100 || !/^[a-z0-9-]+$/.test(data.slug))) {
    errors.push('Slug must be lowercase letters, numbers, and hyphens only, max 100 characters')
  }

  if (data.category && data.category.length > 50) {
    errors.push('Category must be less than 50 characters')
  }

  if (data.tags && data.tags.length > 20) {
    errors.push('Maximum 20 tags allowed')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): ValidationResult {
  const errors: string[] = []
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/markdown'
  ]

  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB')
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not supported. Allowed types: images, PDF, text files')
  }

  if (file.name.length > 255) {
    errors.push('Filename must be less than 255 characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
}

/**
 * Validate URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate site name
 */
export function validateSiteName(name: string): ValidationResult {
  const errors: string[] = []

  if (!name || name.trim().length === 0) {
    errors.push('Site name is required')
  } else if (name.length < 3) {
    errors.push('Site name must be at least 3 characters long')
  } else if (name.length > 50) {
    errors.push('Site name must be less than 50 characters')
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    errors.push('Site name can only contain letters, numbers, spaces, hyphens, and underscores')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}