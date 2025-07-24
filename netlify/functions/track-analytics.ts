import { Handler } from '@netlify/functions'
import { adminDb } from './utils/firebaseAdmin'
import { createHash } from 'crypto'

interface AnalyticsEvent {
  type: 'view' | 'interaction' | 'click'
  contentId?: string
  timestamp: string
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

// Hash IP address for privacy
function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.IP_SALT || 'default-salt').digest('hex').substring(0, 16)
}

// Validate analytics event data
function validateEvent(data: any): data is AnalyticsEvent {
  return (
    data &&
    typeof data.type === 'string' &&
    ['view', 'interaction', 'click'].includes(data.type) &&
    typeof data.timestamp === 'string' &&
    typeof data.userAgent === 'string' &&
    typeof data.referrer === 'string' &&
    typeof data.ip === 'string' &&
    typeof data.sessionId === 'string' &&
    data.metadata &&
    typeof data.metadata.path === 'string' &&
    typeof data.metadata.title === 'string' &&
    typeof data.metadata.category === 'string' &&
    Array.isArray(data.metadata.tags) &&
    data.browserInfo &&
    typeof data.browserInfo.language === 'string' &&
    typeof data.browserInfo.screenResolution === 'string' &&
    typeof data.browserInfo.viewport === 'string' &&
    typeof data.browserInfo.timezone === 'string'
  )
}

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    }
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Request body is required' }),
      }
    }

    const eventData = JSON.parse(event.body)

    // Validate event data
    if (!validateEvent(eventData)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid event data format' }),
      }
    }

    // Get client IP (with privacy hashing)
    const clientIP = event.headers['x-forwarded-for'] || 
                    event.headers['x-real-ip'] || 
                    context.clientContext?.ip || 
                    eventData.ip
    
    const hashedIP = hashIP(clientIP || 'unknown')

    // Create analytics event document
    const analyticsEvent = {
      type: eventData.type,
      contentId: eventData.contentId || null,
      timestamp: new Date(eventData.timestamp),
      userAgent: eventData.userAgent,
      referrer: eventData.referrer,
      ip: hashedIP, // Store hashed IP for privacy
      sessionId: eventData.sessionId,
      metadata: {
        path: eventData.metadata.path,
        title: eventData.metadata.title,
        category: eventData.metadata.category,
        tags: eventData.metadata.tags,
        duration: eventData.metadata.duration || null,
        scrollDepth: eventData.metadata.scrollDepth || null,
        clickTarget: eventData.metadata.clickTarget || null,
      },
      browserInfo: {
        language: eventData.browserInfo.language,
        screenResolution: eventData.browserInfo.screenResolution,
        viewport: eventData.browserInfo.viewport,
        timezone: eventData.browserInfo.timezone,
      },
      createdAt: new Date(),
    }

    // Store in Firestore
    const analyticsRef = adminDb.collection('analytics')
    await analyticsRef.add(analyticsEvent)

    // Also update daily aggregates for performance
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const dailyStatsRef = adminDb.collection('analytics-daily').doc(today)
    
    await adminDb.runTransaction(async (transaction) => {
      const dailyDoc = await transaction.get(dailyStatsRef)
      
      if (dailyDoc.exists) {
        const data = dailyDoc.data()
        const updates: any = {
          totalEvents: (data?.totalEvents || 0) + 1,
          updatedAt: new Date(),
        }
        
        // Update event type counters
        const eventTypeKey = `eventTypes.${eventData.type}`
        updates[eventTypeKey] = (data?.eventTypes?.[eventData.type] || 0) + 1
        
        // Update category counters
        if (eventData.metadata.category) {
          const categoryKey = `categories.${eventData.metadata.category}`
          updates[categoryKey] = (data?.categories?.[eventData.metadata.category] || 0) + 1
        }
        
        transaction.update(dailyStatsRef, updates)
      } else {
        const newDailyStats = {
          date: today,
          totalEvents: 1,
          eventTypes: {
            [eventData.type]: 1,
          },
          categories: eventData.metadata.category ? {
            [eventData.metadata.category]: 1,
          } : {},
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        transaction.set(dailyStatsRef, newDailyStats)
      }
    })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Analytics event tracked successfully',
        eventId: analyticsEvent.sessionId,
      }),
    }
  } catch (error) {
    console.error('Error in track-analytics function:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}