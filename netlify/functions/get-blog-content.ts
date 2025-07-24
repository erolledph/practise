const { Handler } = require('@netlify/functions')
const { adminDb, validateUserAccess, getUserBlogSite, formatTimestamp } = require('./utils/firebaseAdmin')

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
    const { uid, blogId, slug } = event.queryStringParameters || {}

    if (!uid || !blogId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required parameters: uid and blogId' }),
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

    // Validate blog site exists
    const blogSite = await getUserBlogSite(uid, blogId)
    if (!blogSite) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Blog site not found' }),
      }
    }

    const blogPostsRef = adminDb.collection('users').doc(uid).collection('blogPosts')

    if (slug) {
      // Get specific blog post by slug
      const querySnapshot = await blogPostsRef
        .where('siteId', '==', blogId)
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
          body: JSON.stringify({ error: 'Blog post not found' }),
        }
      }

      const doc = querySnapshot.docs[0]
      const postData = doc.data()
      
      const post = {
        id: doc.id,
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        author: postData.author,
        featuredImageUrl: postData.featuredImageUrl,
        metaDescription: postData.metaDescription,
        seoTitle: postData.seoTitle,
        keywords: postData.keywords || [],
        categories: postData.categories || [],
        tags: postData.tags || [],
        contentUrl: postData.contentUrl,
        publishDate: formatTimestamp(postData.publishDate),
        createdAt: formatTimestamp(postData.createdAt),
        updatedAt: formatTimestamp(postData.updatedAt),
        site: {
          id: blogSite.id,
          name: blogSite.name,
          slug: blogSite.slug,
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
        body: JSON.stringify(post),
      }
    } else {
      // Get all published blog posts for the site
      const querySnapshot = await blogPostsRef
        .where('siteId', '==', blogId)
        .where('status', '==', 'published')
        .orderBy('publishDate', 'desc')
        .get()

      const posts = querySnapshot.docs.map(doc => {
        const postData = doc.data()
        return {
          id: doc.id,
          title: postData.title,
          slug: postData.slug,
          content: postData.content,
          author: postData.author,
          featuredImageUrl: postData.featuredImageUrl,
          metaDescription: postData.metaDescription,
          seoTitle: postData.seoTitle,
          keywords: postData.keywords || [],
          categories: postData.categories || [],
          tags: postData.tags || [],
          contentUrl: postData.contentUrl,
          publishDate: formatTimestamp(postData.publishDate),
          createdAt: formatTimestamp(postData.createdAt),
          updatedAt: formatTimestamp(postData.updatedAt),
        }
      })

      const response = {
        site: {
          id: blogSite.id,
          name: blogSite.name,
          slug: blogSite.slug,
          createdAt: formatTimestamp(blogSite.createdAt),
        },
        posts,
        total: posts.length,
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
    console.error('Error in get-blog-content function:', error)
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