// Client-side analytics tracking utility
interface AnalyticsEventData {
  type: 'view' | 'interaction' | 'click'
  contentId?: string
  metadata: {
    path: string
    title: string
    category: string
    tags: string[]
    duration?: number
    scrollDepth?: number
    clickTarget?: string
  }
}

class AnalyticsTracker {
  private sessionId: string
  private startTime: number
  private maxScrollDepth: number = 0

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.setupScrollTracking()
    this.setupUnloadTracking()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupScrollTracking() {
    let ticking = false
    
    const updateScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)
      
      if (scrollPercent > this.maxScrollDepth) {
        this.maxScrollDepth = Math.min(scrollPercent, 100)
      }
      
      ticking = false
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDepth)
        ticking = true
      }
    })
  }

  private setupUnloadTracking() {
    window.addEventListener('beforeunload', () => {
      // Track page duration on unload
      const duration = Date.now() - this.startTime
      if (duration > 1000) { // Only track if user stayed more than 1 second
        this.trackEvent({
          type: 'interaction',
          metadata: {
            path: window.location.pathname,
            title: document.title,
            category: this.getPageCategory(),
            tags: this.getPageTags(),
            duration: Math.round(duration / 1000), // Convert to seconds
            scrollDepth: this.maxScrollDepth,
          }
        })
      }
    })
  }

  private getPageCategory(): string {
    const path = window.location.pathname
    if (path.includes('/blog/')) return 'blog'
    if (path.includes('/products/')) return 'products'
    if (path.includes('/files')) return 'files'
    if (path.includes('/analytics')) return 'analytics'
    if (path.includes('/settings')) return 'settings'
    if (path.includes('/dashboard')) return 'dashboard'
    return 'other'
  }

  private getPageTags(): string[] {
    const tags: string[] = []
    const path = window.location.pathname
    
    // Extract tags from URL path
    if (path.includes('/create')) tags.push('create')
    if (path.includes('/manage')) tags.push('manage')
    if (path.includes('/settings')) tags.push('settings')
    
    // Add meta keywords if available
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content')
    if (metaKeywords) {
      tags.push(...metaKeywords.split(',').map(tag => tag.trim()))
    }
    
    return tags
  }

  private getBrowserInfo() {
    return {
      language: navigator.language || 'unknown',
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
    }
  }

  async trackEvent(eventData: AnalyticsEventData): Promise<void> {
    try {
      const payload = {
        ...eventData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || '',
        ip: '', // Will be filled by the server
        sessionId: this.sessionId,
        browserInfo: this.getBrowserInfo(),
      }

      // Use sendBeacon for better reliability, fallback to fetch
      const data = JSON.stringify(payload)
      
      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/track', blob)
      } else {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data,
          keepalive: true,
        })
      }
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  // Public methods for manual tracking
  trackPageView(contentId?: string) {
    this.trackEvent({
      type: 'view',
      contentId,
      metadata: {
        path: window.location.pathname,
        title: document.title,
        category: this.getPageCategory(),
        tags: this.getPageTags(),
      }
    })
  }

  trackClick(target: string, contentId?: string) {
    this.trackEvent({
      type: 'click',
      contentId,
      metadata: {
        path: window.location.pathname,
        title: document.title,
        category: this.getPageCategory(),
        tags: this.getPageTags(),
        clickTarget: target,
      }
    })
  }

  trackInteraction(action: string, contentId?: string, duration?: number) {
    this.trackEvent({
      type: 'interaction',
      contentId,
      metadata: {
        path: window.location.pathname,
        title: document.title,
        category: this.getPageCategory(),
        tags: [...this.getPageTags(), action],
        duration,
        scrollDepth: this.maxScrollDepth,
      }
    })
  }
}

// Create global analytics instance
export const analytics = new AnalyticsTracker()

// Auto-track page views
if (typeof window !== 'undefined') {
  // Track initial page view
  analytics.trackPageView()
  
  // Track page views on navigation (for SPAs)
  let currentPath = window.location.pathname
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname
      analytics.trackPageView()
    }
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}