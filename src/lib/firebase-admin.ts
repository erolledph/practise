import { doc, updateDoc, arrayUnion, collection, addDoc, getDocs, query, where, deleteDoc, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'
import { BlogSite, ProductSite, BlogPost, Product, FileItem } from '@/types'
import { generateSlug, generateUniqueId } from './utils'

// Blog Site Management
export async function createBlogSite(userId: string, siteName: string): Promise<BlogSite> {
  const slug = generateSlug(siteName)
  const newSite: BlogSite = {
    id: generateUniqueId('blog'),
    name: siteName,
    slug,
    createdAt: new Date(),
    postCount: 0
  }

  // Update user document
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    blogSites: arrayUnion(newSite)
  })

  return newSite
}

export async function createProductSite(userId: string, siteName: string, description?: string): Promise<ProductSite> {
  const slug = generateSlug(siteName)
  const newSite: ProductSite = {
    id: generateUniqueId('product'),
    name: siteName,
    slug,
    description,
    createdAt: new Date(),
    productCount: 0,
    defaultCurrency: 'USD'
  }

  // Update user document
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, {
    productSites: arrayUnion(newSite)
  })

  return newSite
}

// Blog Post Management
export async function createBlogPost(userId: string, siteId: string, postData: Partial<BlogPost>): Promise<string> {
  const slug = generateSlug(postData.title || 'untitled')
  const post: Omit<BlogPost, 'id'> = {
    siteId,
    title: postData.title || 'Untitled Post',
    slug,
    content: postData.content || '',
    featuredImageUrl: postData.featuredImageUrl,
    metaDescription: postData.metaDescription,
    seoTitle: postData.seoTitle,
    keywords: postData.keywords || [],
    author: postData.author || 'Admin',
    categories: postData.categories || [],
    tags: postData.tags || [],
    status: postData.status || 'draft',
    contentUrl: `/users/${userId}/blogs/${siteId}/api/content/${slug}.json`,
    publishDate: postData.status === 'published' ? new Date() : undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const docRef = await addDoc(collection(db, 'users', userId, 'blogPosts'), post)
  return docRef.id
}

export async function getBlogPosts(userId: string, siteId?: string): Promise<BlogPost[]> {
  let q
  
  if (siteId) {
    q = query(collection(db, 'users', userId, 'blogPosts'), where('siteId', '==', siteId)) as any
  } else {
    q = collection(db, 'users', userId, 'blogPosts')
  }

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as BlogPost))
}

// Product Management
export async function createProduct(userId: string, siteId: string, productData: Partial<Product>): Promise<string> {
  const slug = generateSlug(productData.name || 'untitled')
  const originalPrice = productData.originalPrice || productData.price || 0
  const price = productData.price || 0
  const percentOff = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
  const savings = originalPrice - price

  const product: Omit<Product, 'id'> = {
    siteId,
    name: productData.name || 'Untitled Product',
    slug,
    description: productData.description,
    price,
    originalPrice,
    percentOff,
    discountedPrice: price,
    savings,
    currency: productData.currency || 'USD',
    imageUrl: productData.imageUrl,
    imageUrls: productData.imageUrls || [],
    productUrl: productData.productUrl,
    category: productData.category,
    tags: productData.tags || [],
    status: productData.status || 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const docRef = await addDoc(collection(db, 'users', userId, 'products'), product)
  return docRef.id
}

export async function getProducts(userId: string, siteId?: string): Promise<Product[]> {
  let q
  
  if (siteId) {
    q = query(collection(db, 'users', userId, 'products'), where('siteId', '==', siteId)) as any
  } else {
    q = collection(db, 'users', userId, 'products')
  }

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product))
}

// File Management
export async function uploadFile(userId: string, file: File): Promise<FileItem> {
  const filename = `${Date.now()}_${file.name}`
  const storagePath = `users/${userId}/files/${filename}`
  const storageRef = ref(storage, storagePath)

  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)

  const fileItem: Omit<FileItem, 'id'> = {
    originalName: file.name,
    filename,
    size: file.size,
    originalSize: file.size,
    type: file.type,
    downloadURL,
    storagePath,
    wasProcessed: false,
    uploadedAt: new Date(),
    createdAt: new Date(),
    userId,
    userEmail: '' // Will be filled by the calling component
  }

  const docRef = await addDoc(collection(db, 'users', userId, 'files'), fileItem)
  return { id: docRef.id, ...fileItem }
}

export async function getFiles(userId: string): Promise<FileItem[]> {
  const querySnapshot = await getDocs(collection(db, 'users', userId, 'files'))
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FileItem))
}

export async function deleteFile(userId: string, fileId: string, storagePath: string): Promise<void> {
  // Delete from storage
  const storageRef = ref(storage, storagePath)
  await deleteObject(storageRef)

  // Delete from firestore
  await deleteDoc(doc(db, 'users', userId, 'files', fileId))
}

// Generic CRUD operations
export async function updateDocument(userId: string, collection: string, docId: string, data: any): Promise<void> {
  const docRef = doc(db, 'users', userId, collection, docId)
  await updateDoc(docRef, { ...data, updatedAt: new Date() })
}

export async function deleteDocument(userId: string, collection: string, docId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, collection, docId))
}

export async function getDocument(userId: string, collection: string, docId: string): Promise<any> {
  const docRef = doc(db, 'users', userId, collection, docId)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  return null
}