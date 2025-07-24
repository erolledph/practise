import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Store initialization error if it occurs
let initError: Error | null = null

// Initialize Firebase Admin SDK
let app
let adminDb: any = null

try {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set')
    }

    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    })
  } else {
    app = getApps()[0]
  }
  
  adminDb = getFirestore(app)
} catch (error) {
  console.error('Firebase Admin SDK initialization failed:', error)
  initError = error as Error
}

export { adminDb, initError }

// Helper function to validate user access
export async function validateUserAccess(uid: string): Promise<boolean> {
  if (!adminDb) {
    console.error('Firebase Admin DB not initialized')
    return false
  }
  
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get()
    return userDoc.exists
  } catch (error) {
    console.error('Error validating user access:', error)
    return false
  }
}

// Helper function to get user's blog site
export async function getUserBlogSite(uid: string, blogId: string) {
  if (!adminDb) {
    console.error('Firebase Admin DB not initialized')
    return null
  }
  
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get()
    if (!userDoc.exists) return null
    
    const userData = userDoc.data()
    const blogSite = userData?.blogSites?.find((site: any) => site.id === blogId)
    return blogSite || null
  } catch (error) {
    console.error('Error getting blog site:', error)
    return null
  }
}

// Helper function to get user's product site
export async function getUserProductSite(uid: string, siteId: string) {
  if (!adminDb) {
    console.error('Firebase Admin DB not initialized')
    return null
  }
  
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get()
    if (!userDoc.exists) return null
    
    const userData = userDoc.data()
    const productSite = userData?.productSites?.find((site: any) => site.id === siteId)
    return productSite || null
  } catch (error) {
    console.error('Error getting product site:', error)
    return null
  }
}

// Helper function to format Firestore timestamp
export function formatTimestamp(timestamp: any) {
  if (!timestamp) return null
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString()
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString()
  }
  return timestamp
}