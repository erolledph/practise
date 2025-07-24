/**
 * Application constants and configuration
 */

export const APP_CONFIG = {
  name: 'Firebase CMS',
  version: '1.0.0',
  description: 'Modern content management system built with React, TypeScript, and Firebase',
  author: 'Firebase CMS Team',
  repository: 'https://github.com/firebase-cms/firebase-cms',
  documentation: 'https://docs.firebase-cms.com'
}

export const LIMITS = {
  // User limits
  maxBlogSites: 3,
  maxProductSites: 3,
  maxFilesPerUser: 1000,
  maxStoragePerUser: 100 * 1024 * 1024, // 100MB

  // Content limits
  maxBlogPostsPerSite: 1000,
  maxProductsPerSite: 1000,
  maxCategoriesPerPost: 10,
  maxTagsPerPost: 20,
  maxKeywordsPerPost: 15,
  maxTagsPerProduct: 20,

  // File limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxImagesPerProduct: 5,
  maxImagesPerPost: 1,

  // Text limits
  maxTitleLength: 200,
  maxSlugLength: 100,
  maxMetaDescriptionLength: 160,
  maxSiteNameLength: 50,
  maxSiteDescriptionLength: 200,
  maxCategoryLength: 50,
  maxTagLength: 30,
  maxKeywordLength: 30
}

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
]

export const SUPPORTED_TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Kolkata', label: 'Mumbai' },
  { value: 'Australia/Sydney', label: 'Sydney' }
]

export const SUPPORTED_DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY' }
]

export const SUPPORTED_FILE_TYPES = {
  images: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp']
  },
  documents: {
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  }
}

export const API_ENDPOINTS = {
  blogContent: (uid: string, blogId: string) => `/users/${uid}/blogs/${blogId}/api/content.json`,
  blogPost: (uid: string, blogId: string, slug: string) => `/users/${uid}/blogs/${blogId}/api/content/${slug}.json`,
  products: (uid: string, siteId: string) => `/users/${uid}/productSites/${siteId}/api/products.json`,
  product: (uid: string, siteId: string, slug: string) => `/users/${uid}/productSites/${siteId}/api/products/${slug}.json`,
  analytics: '/api/analytics/track',
  userAnalytics: (uid: string) => `/api/analytics/${uid}`
}

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'status-draft' },
  { value: 'published', label: 'Published', color: 'status-published' }
]

export const CONTENT_CATEGORIES = [
  'Technology',
  'Web Development',
  'Mobile Development',
  'Design',
  'Business',
  'Marketing',
  'Tutorial',
  'News',
  'Review',
  'Opinion',
  'Guide',
  'Tips',
  'Best Practices',
  'Case Study',
  'Interview',
  'Other'
]

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Computers',
  'Mobile Devices',
  'Audio & Video',
  'Gaming',
  'Software',
  'Books',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Health & Beauty',
  'Automotive',
  'Tools',
  'Toys',
  'Food & Beverage',
  'Other'
]

export const EXPORT_FORMATS = [
  { value: 'json', label: 'JSON', mimeType: 'application/json' },
  { value: 'csv', label: 'CSV', mimeType: 'text/csv' },
  { value: 'markdown', label: 'Markdown', mimeType: 'text/markdown' }
]

export const ANALYTICS_EVENT_TYPES = [
  'view',
  'interaction',
  'click'
] as const

export const PAGINATION_OPTIONS = [
  { value: 10, label: '10 per page' },
  { value: 25, label: '25 per page' },
  { value: 50, label: '50 per page' },
  { value: 100, label: '100 per page' }
]

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
]

export const NOTIFICATION_TYPES = [
  'success',
  'error',
  'warning',
  'info'
] as const

export const DEFAULT_USER_SETTINGS = {
  currency: 'USD',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  itemsPerPage: 25,
  defaultContentStatus: 'draft' as const,
  emailNotifications: true,
  browserNotifications: false,
  weeklySummary: true
}

export const CACHE_DURATIONS = {
  apiResponse: 5 * 60 * 1000, // 5 minutes
  userSettings: 10 * 60 * 1000, // 10 minutes
  analytics: 15 * 60 * 1000 // 15 minutes
}

export const ERROR_MESSAGES = {
  generic: 'An unexpected error occurred. Please try again.',
  network: 'Network error. Please check your connection and try again.',
  authentication: 'Authentication failed. Please sign in again.',
  authorization: 'You do not have permission to perform this action.',
  validation: 'Please check your input and try again.',
  fileUpload: 'File upload failed. Please try again.',
  fileSizeLimit: 'File size exceeds the maximum limit.',
  fileTypeNotSupported: 'File type is not supported.',
  quotaExceeded: 'You have reached your usage limit.',
  notFound: 'The requested resource was not found.',
  serverError: 'Server error. Please try again later.'
}

export const SUCCESS_MESSAGES = {
  created: 'Created successfully!',
  updated: 'Updated successfully!',
  deleted: 'Deleted successfully!',
  uploaded: 'Uploaded successfully!',
  saved: 'Saved successfully!',
  published: 'Published successfully!',
  copied: 'Copied to clipboard!',
  exported: 'Exported successfully!'
}