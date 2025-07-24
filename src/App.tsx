import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { SignIn } from '@/pages/auth/SignIn'
import { SignUp } from '@/pages/auth/SignUp'
import { PasswordReset } from '@/pages/auth/PasswordReset'
import { Dashboard } from '@/pages/Dashboard'
import { CreateBlogSite } from '@/pages/blog/CreateBlogSite'
import { CreateBlogPost } from '@/pages/blog/CreateBlogPost'
import ManageBlogPosts from '@/pages/blog/ManageBlogPosts'
import { EditBlogPost } from '@/pages/blog/EditBlogPost'
import { BlogSiteSettings } from '@/pages/blog/BlogSiteSettings'
import { CreateProductSite } from '@/pages/products/CreateProductSite'
import { CreateProduct } from '@/pages/products/CreateProduct'
import ManageProducts from '@/pages/products/ManageProducts'
import { EditProduct } from '@/pages/products/EditProduct'
import { ProductSiteSettings } from '@/pages/products/ProductSiteSettings'
import { FileManager } from '@/pages/files/FileManager'
import { Analytics } from '@/pages/analytics/Analytics'
import { Settings } from '@/pages/settings/Settings'
import { Documentation } from '@/pages/documentation/Documentation'
import { NotFound } from '@/pages/NotFound'
import { useAuth } from '@/hooks/useAuth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/signin" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/auth/signin" element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        } />
        <Route path="/auth/signup" element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } />
        <Route path="/auth/reset" element={
          <PublicRoute>
            <PasswordReset />
          </PublicRoute>
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Analytics */}
          <Route path="analytics" element={<Analytics />} />
          
          {/* Blog Management */}
          <Route path="blog/create" element={<CreateBlogSite />} />
          <Route path="blog/:siteId/create-content" element={<CreateBlogPost />} />
          <Route path="blog/:siteId/manage-content" element={<ManageBlogPosts />} />
          <Route path="blog/:siteId/edit-content/:postId" element={<EditBlogPost />} />
          <Route path="blog/:siteId/settings" element={<BlogSiteSettings />} />
          
          {/* Product Management */}
          <Route path="products/create" element={<CreateProductSite />} />
          <Route path="products/:siteId/create-product" element={<CreateProduct />} />
          <Route path="products/:siteId/manage-products" element={<ManageProducts />} />
          <Route path="products/:siteId/edit-product/:productId" element={<EditProduct />} />
          <Route path="products/:siteId/settings" element={<ProductSiteSettings />} />
          
          {/* File Manager */}
          <Route path="files" element={<FileManager />} />
          
          {/* Documentation */}
          <Route path="documentation" element={<Documentation />} />
          
          {/* Settings */}
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App