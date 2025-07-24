const { Handler } = require('@netlify/functions')
const { adminDb, initError, validateUserAccess } = require('./utils/firebaseAdmin')

exports.handler = async (event, context) => {
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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
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
    // Check for Firebase initialization error
    if (initError) {
      console.error('Firebase initialization error:', initError)
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Database connection failed',
          details: 'Firebase Admin SDK initialization failed'
        }),
      }
    }

    if (!adminDb) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: 'Database not available',
          details: 'Firebase Admin DB not initialized'
        }),
      }
    }

    const { uid, days = '30' } = event.queryStringParameters || {}

    if (!uid) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required parameter: uid' }),
      }
    }

    // Validate user access
    const hasAccess = await validateUserAccess(uid)
    if (!hasAccess) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'User not found' }),
      }
    }

    const daysCount = parseInt(days, 10)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysCount)

    // Get daily analytics aggregates
    const dailyStatsRef = adminDb.collection('analytics-daily')
    const dailyQuery = await dailyStatsRef
      .where('date', '>=', startDate.toISOString().split('T')[0])
      .orderBy('date', 'desc')
      .get()

    const dailyStats = dailyQuery.docs.map(doc => ({
      date: doc.id,
      ...doc.data(),
    }))

    // Calculate totals
    const totals = dailyStats.reduce((acc, day) => {
      acc.totalEvents += day.totalEvents || 0
      
      // Aggregate event types
      if (day.eventTypes) {
        Object.entries(day.eventTypes).forEach(([type, count]) => {
          acc.eventTypes[type] = (acc.eventTypes[type] || 0) + (count as number)
        })
      }
      
      // Aggregate categories
      if (day.categories) {
        Object.entries(day.categories).forEach(([category, count]) => {
          acc.categories[category] = (acc.categories[category] || 0) + (count as number)
        })
      }
      
      return acc
    }, {
      totalEvents: 0,
      eventTypes: {} as Record<string, number>,
      categories: {} as Record<string, number>,
    })

    // Get recent individual events for detailed analysis
    const recentEventsQuery = await adminDb.collection('analytics')
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get()

    const recentEvents = recentEventsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }))

    // Calculate unique sessions and visitors (based on sessionId and hashed IP)
    const uniqueSessions = new Set(recentEvents.map(event => event.sessionId)).size
    const uniqueVisitors = new Set(recentEvents.map(event => event.ip)).size

    // Top content analysis
    const contentViews = recentEvents
      .filter(event => event.type === 'view' && event.contentId)
      .reduce((acc, event) => {
        const key = `${event.contentId}:${event.metadata?.title || 'Unknown'}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const topContent = Object.entries(contentViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, views]) => {
        const [contentId, title] = key.split(':')
        return { contentId, title, views }
      })

    // Browser and device analysis
    const browsers = recentEvents.reduce((acc, event) => {
      const userAgent = event.userAgent || 'Unknown'
      let browser = 'Unknown'
      
      if (userAgent.includes('Chrome')) browser = 'Chrome'
      else if (userAgent.includes('Firefox')) browser = 'Firefox'
      else if (userAgent.includes('Safari')) browser = 'Safari'
      else if (userAgent.includes('Edge')) browser = 'Edge'
      
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const response = {
      period: {
        days: daysCount,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      summary: {
        totalEvents: totals.totalEvents,
        uniqueSessions,
        uniqueVisitors,
        avgEventsPerSession: uniqueSessions > 0 ? Math.round(totals.totalEvents / uniqueSessions * 100) / 100 : 0,
      },
      eventTypes: totals.eventTypes,
      categories: totals.categories,
      dailyStats: dailyStats.slice(0, 30), // Last 30 days max
      topContent,
      browsers,
      recentEvents: recentEvents.slice(0, 20), // Last 20 events
      generatedAt: new Date().toISOString(),
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
      },
      body: JSON.stringify(response),
    }
  } catch (error) {
    console.error('Error in get-analytics function:', error)
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