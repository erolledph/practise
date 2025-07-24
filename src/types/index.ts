export interface User {
  uid: string
  email: string
  createdAt: Date
  blogSites: BlogSite[]
  productSites: ProductSite[]
  plan: 'free' | 'premium'
}

export interface BlogSite {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt?: Date
  postCount: number
}

export interface ProductSite {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: Date
  updatedAt?: Date
  productCount: number
  defaultCurrency: string
}

export interface BlogPost {
  id: string
  siteId: string
  title: string
  slug: string
  content: string
  featuredImageUrl?: string
  metaDescription?: string
  seoTitle?: string
  keywords: string[]
  author: string
  categories: string[]
  tags: string[]
  status: 'draft' | 'published'
  contentUrl: string
  publishDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  siteId: string
  name: string
  slug: string
  description?: string
  price: number
  originalPrice: number
  percentOff: number
  discountedPrice: number
  savings: number
  currency: string
  imageUrl?: string
  imageUrls: string[]
  productUrl?: string
  category?: string
  tags: string[]
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
}

export interface FileItem {
  id: string
  originalName: string
  filename: string
  size: number
  originalSize: number
  type: string
  downloadURL: string
  storagePath: string
  dimensions?: {
    width: number
    height: number
  }
  wasProcessed: boolean
  compressionRatio?: string
  uploadedAt: Date
  createdAt: Date
  userId: string
  userEmail: string
}

export interface UserSettings {
  currency: string
  timezone: string
  dateFormat: string
  itemsPerPage: number
  defaultContentStatus: 'draft' | 'published'
  emailNotifications: boolean
  browserNotifications: boolean
  weeklySummary: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AnalyticsEvent {
  id: string
  type: 'view' | 'interaction' | 'click'
  contentId?: string
  timestamp: Date
  userAgent: string
  referrer: string
  ip: string
  sessionId: string
  metadata: {
    path: string
    title: string
    category: string
    tags: string[]
    duration?: number
    scrollDepth?: number
    clickTarget?: string
  }
  browserInfo: {
    language: string
    screenResolution: string
    viewport: string
    timezone: string
  }
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}