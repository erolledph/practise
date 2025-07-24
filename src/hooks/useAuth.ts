import { useState, useEffect } from 'react'
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        await ensureUserDocuments(firebaseUser)
        await loadUserData(firebaseUser.uid)
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const ensureUserDocuments = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: firebaseUser.email,
          createdAt: serverTimestamp(),
          blogSites: [],
          productSites: [],
          plan: 'free'
        })
      }

      const userSettingsRef = doc(db, 'users', firebaseUser.uid, 'settings', 'userSettingsDoc')
      const userSettingsDoc = await getDoc(userSettingsRef)
      
      if (!userSettingsDoc.exists()) {
        await setDoc(userSettingsRef, {
          currency: 'USD',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          itemsPerPage: 25,
          defaultContentStatus: 'draft',
          emailNotifications: true,
          browserNotifications: false,
          weeklySummary: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error ensuring user documents:', error)
    }
  }

  const loadUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        const data = userDoc.data()
        
        // Convert Firestore Timestamps to Date objects in blogSites and productSites
        const blogSites = (data.blogSites || []).map((site: any) => ({
          ...site,
          createdAt: site.createdAt?.toDate ? site.createdAt.toDate() : site.createdAt,
          updatedAt: site.updatedAt?.toDate ? site.updatedAt.toDate() : site.updatedAt
        }))
        
        const productSites = (data.productSites || []).map((site: any) => ({
          ...site,
          createdAt: site.createdAt?.toDate ? site.createdAt.toDate() : site.createdAt,
          updatedAt: site.updatedAt?.toDate ? site.updatedAt.toDate() : site.updatedAt
        }))
        
        setUserData({
          uid,
          email: data.email,
          createdAt: data.createdAt?.toDate() || new Date(),
          blogSites,
          productSites,
          plan: data.plan || 'free'
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const refreshUserData = async () => {
    if (user) {
      await loadUserData(user.uid)
    }
  }

  return {
    user,
    userData,
    loading,
    logout,
    refreshUserData,
    isAuthenticated: !!user
  }
}