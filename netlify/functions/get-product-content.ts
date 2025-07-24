import { Handler } from '@netlify/functions'
import { adminDb, validateUserAccess, getUserProductSite, formatTimestamp } from './utils/firebaseAdmin'

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
    const { uid, siteId, slug } = event.queryStringParameters || {}

    if (!uid || !siteId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required parameters: uid and siteId' }),
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

    // Validate product site exists
    const productSite = await getUserProductSite(uid, siteId)
    if (!productSite) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Product site not found' }),
      }
    }

    const productsRef = adminDb.collection('users').doc(uid).collection('products')

    if (slug) {
      // Get specific product by slug
      const querySnapshot = await productsRef
        .where('siteId', '==', siteId)
        .where('slug', '==', slug)
        .where('status', '==', 'published')
        .limit(1)
        .get()

      if (querySnapshot.empty) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'Product not found' }),
        }
      }

      const doc = querySnapshot.docs[0]
      const productData = doc.data()
      
      const product = {
        id: doc.id,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        originalPrice: productData.originalPrice,
        percentOff: productData.percentOff,
        discountedPrice: productData.discountedPrice,
        savings: productData.savings,
        currency: productData.currency,
        imageUrl: productData.imageUrl,
        imageUrls: productData.imageUrls || [],
        productUrl: productData.productUrl,
        category: productData.category,
        tags: productData.tags || [],
        createdAt: formatTimestamp(productData.createdAt),
        updatedAt: formatTimestamp(productData.updatedAt),
        site: {
          id: productSite.id,
          name: productSite.name,
          slug: productSite.slug,
          defaultCurrency: productSite.defaultCurrency,
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
        body: JSON.stringify(product),
      }
    } else {
      // Get all published products for the site
      const querySnapshot = await productsRef
        .where('siteId', '==', siteId)
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .get()

      const products = querySnapshot.docs.map(doc => {
        const productData = doc.data()
        return {
          id: doc.id,
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price,
          originalPrice: productData.originalPrice,
          percentOff: productData.percentOff,
          discountedPrice: productData.discountedPrice,
          savings: productData.savings,
          currency: productData.currency,
          imageUrl: productData.imageUrl,
          imageUrls: productData.imageUrls || [],
          productUrl: productData.productUrl,
          category: productData.category,
          tags: productData.tags || [],
          createdAt: formatTimestamp(productData.createdAt),
          updatedAt: formatTimestamp(productData.updatedAt),
        }
      })

      // Group products by category
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
      const productsByCategory = categories.reduce((acc, category) => {
        acc[category] = products.filter(p => p.category === category)
        return acc
      }, {} as Record<string, any[]>)

      const response = {
        site: {
          id: productSite.id,
          name: productSite.name,
          slug: productSite.slug,
          description: productSite.description,
          defaultCurrency: productSite.defaultCurrency,
          createdAt: formatTimestamp(productSite.createdAt),
        },
        products,
        categories,
        productsByCategory,
        total: products.length,
        generatedAt: new Date().toISOString(),
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
        body: JSON.stringify(response),
      }
    }
  } catch (error) {
    console.error('Error in get-product-content function:', error)
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